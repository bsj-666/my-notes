# 安徽机房

## 安徽机房功能梳理

### 能耗统计

**1. 定时采集与落库（用电统计主链）**
入口是 EnergyStatisticsTask.java (line 68)，每小时整点跑一次。流程是：先按设备类型拆两批设备（配电 54，IT 50/53）EnergyStatisticsTask.java (line 73)，月初零点先归档上月数据 EnergyStatisticsTask.java (line 80)，再并发调用服务采集 EnergyStatisticsTask.java (line 86)。

单设备采集在 ElectricityServiceImpl.java (line 265)：

- 配电取点位“组合有功总电能”，IT取两路进线累计点位 ElectricityServiceImpl.java (line 95)。
- 从 df_jk_yc 取最新点位，按点位名去重并汇总成当前累计电能快照（totalEnergy + collectTime）ElectricityServiceImpl.java (line 363)。
- 增量电量 = currentTotal - lastTotal，负值直接置 0 ElectricityServiceImpl.java (line 509)。
- 周期判断用“上次采集日期 vs 本次采集日期”计算跨天/跨周/跨月（不再依赖 hour==0）ElectricityServiceImpl.java (line 751)。
- 日序列是固定 24 槽，按采集小时写到对应索引 ElectricityServiceImpl.java (line 537)。
- 周/月序列存“当天累计值”，跨天先补槽，再回写最后一个槽位 ElectricityServiceImpl.java (line 342)。

月归档逻辑在 EnergyStatisticsTask.java (line 99)：取 df_electricity_statistics 当前 energy_monthly_kwh 求和，写入 his_rack_statistics。

**2. 用电量查询（getElectricityStatistics）**
查询入口在 ElectricityServiceImpl.java (line 196)。按机房取 df_electricity_statistics 所有设备后：

- dailyElectricity：把各设备 energy_daily_kwh 按索引求和，再裁剪到“当天 0 点到当前时刻” ElectricityServiceImpl.java (line 225)。
- weeklyElectricity：按索引求和后裁剪到“周一到前一天” ElectricityServiceImpl.java (line 228)。
- monthlyElectricity：按索引求和后裁剪到“每月1号到前一天” ElectricityServiceImpl.java (line 231)。
- 同时返回 lastMonthlyElectricity（上月序列）和 monthlyCurrentElectricity（本月累计）ElectricityServiceImpl.java (line 234)。

**3. PUE 查询（getEnergyStatistics）**
PUE 查询入口在 ElectricityServiceImpl.java (line 125)。

- 分子（总电）取设备类型 54，分母（IT电）取 50/53 ElectricityServiceImpl.java (line 137)。
- 当前 pue 用 last_total_energy_kwh 汇总计算：pue = totalLastTotal / itLastTotal ElectricityServiceImpl.java (line 155)。
- 趋势 daily/weekly/monthlyPueTrend 是先把两类设备序列按索引汇总，再逐点 total/it 计算，并按时间窗口裁剪 ElectricityServiceImpl.java (line 145) ElectricityServiceImpl.java (line 449)。

核心上，当前系统是“双口径并存”：

- 当前值（瞬时）看 last_total_energy_kwh；
- 趋势看日/周/月字符串序列。

### 数据采集-告警-短信流程

```mermaid
flowchart TD
  A["定时任务触发"] --> B{"每5分钟主采集?"}
  A --> C{"每1分钟恢复扫描?"}

  B --> D["加载设备与映射信息"]
  D --> E["逐设备采集YC/YX实时值"]
  E --> F{"点位异常且Redis无该点位上下文?"}
  F -->|"否"| G["继续下一点位"]
  F -->|"是"| H1["计算等级与告警内容"]

  H1["计算等级与告警内容"]
  H1 --> H2["插入告警记录到数据库"]
  H2 --> H3["创建值班任务"]
  H3 --> H4["告警推送前端"]
  H4 --> H5{"紧急或者重要告警且enableAlarm=1?"}
  H5 -->|"是"| H6["写Redis  状态：待观察(state=WAITING_5_MIN) deadline=+5min"]
  H5 -->|"否"| H7["不写待观察上下文"]
  H6 --> G
  H7 --> G

  G --> I["打印五分钟采集告警统计"]
  I --> J["handleTimeoutAlarmSms"]

  J --> J1["扫描Redis待观察key"]
  J1 --> J2{"抢点位短锁成功?"}
  J2 -->|"否"| J1
  J2 -->|"是"| J3{"state=WAITING_5_MIN 且 已到deadline?"}
  J3 -->|"否"| J1
  J3 -->|"是"| J4{"告警记录存在且未处理?"}
  J4 -->|"否"| J5["清理Redis上下文"]
  J4 -->|"是"| J6{"enableAlarm=1?"}
  J6 -->|"是"| J7["发送告警短信"]
  J7 --> J8["state->ALARM_SENT 并设置过期时间"]
  J6 -->|"否"| J9["不发短信 但state->ALARM_SENT并设置过期时间"]
  J5 --> J1
  J8 --> J1
  J9 --> J1

  J1 --> K["打印五分钟短信统计"]

  C --> L["scanPendingAlarmTask 扫描Redis中的告警点位"]
  L --> M{"点位当前值已恢复?"}
  M -->|"否"| L
  M -->|"是"| N["triggerRestoreAlarm处理点位恢复逻辑"]
  N --> N1{"抢点位短锁成功?"}
  N1 -->|"否"| L
  N1 -->|"是"| N2["更新告警为已处理"]
  N2 --> N3{"点位允许发送短信?"}
  N3 -->|"是"| N4["发送恢复短信"]
  N3 -->|"否"| N5["跳过恢复短信"]
  N4 --> N6["删除Redis上下文"]
  N5 --> N6
  N6 --> N7["删除值班任务"]
  N7 --> L

```



### 短信发送

```mermaid
flowchart TD
  A["进入 sendNotification / sendRestoreNotification"] --> B["查询接收人: duty_person where msg_all=1"]
  B --> C{"遍历每个接收人"}

  C --> D{"人员状态是否可发?\nisOn=1 且 isSendmsg=1\n(恢复短信分支当前只严格校验 isOn)"}
  D -->|否| E["记录日志: 跳过该接收人"]
  D -->|是| F{"发送告警短信还是恢复短信?"}

  F -->|告警短信| G["buildAlarmSmsEntity:\n填充时间/等级/手机号邮箱/短信内容"]
  F -->|恢复短信| H["buildRestoreSmsEntity:\n填充恢复时间/等级/恢复值/手机号邮箱/短信内容"]

  G --> I["ObjectMapper转JSON报文"]
  H --> I
  I --> J["UdpUtils.sendUdpData(ip,port,msg) 发送到短信网关"]

  J --> K{"发送是否异常?"}
  K -->|否| L["记录发送成功日志(当前只体现在前置info日志)"]
  K -->|是| M["记录error日志: 发送失败"]

  E --> C
  L --> C
  M --> C

  C --> N{"还有下一个接收人?"}
  N -->|是| C
  N -->|否| O["结束"]

  subgraph "关键内容组装"
    P["fillCommonSmsFields:\nphone/mail/sms/ismail/isphone/ismessage"]
    Q["utf8String:\n短信内容转16进制字符串"]
  end

  G --> P
  H --> P
  G --> Q
  H --> Q

```



## 安徽机房项目踩坑

### @JsonFormat注解在BeanUtils.copyProperties()方法中会失效

##### 核心原理：

让我们来解析一下两个工具的工作机制：

- **@JsonFormat 的工作方式**：它的功能由 Jackson 库实现。只有当您使用 `ObjectMapper`（如 `objectMapper.writeValueAsString(obj)`）将对象序列化为 JSON 字符串时，Jackson 才会去读取这个注解，并按照您指定的 `pattern`（如 `yyyy-MM-dd HH:mm:ss`）来格式化时间字段。
- **BeanUtils.copyProperties() 的工作方式**：这个方法通过 Java 反射机制工作。它会找到源对象和目标对象中**同名的属性**，然后调用属性的 `getXxx()` 方法从源对象读取值，再调用 `setXxx()` 方法将值写入目标对象。这个过程完全是内存中的字段值拷贝，**既不涉及 JSON 转换，也不会检查和解析任何 Jackson 相关的注解**。



