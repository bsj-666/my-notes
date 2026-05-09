import{_ as a,o as i,c as n,ag as t}from"./chunks/framework.BS9hZhOX.js";const c=JSON.parse('{"title":"安徽机房","description":"","frontmatter":{},"headers":[],"relativePath":"notes/ahjf.md","filePath":"notes/ahjf.md"}'),l={name:"notes/ahjf.md"};function e(p,s,E,h,o,k){return i(),n("div",null,[...s[0]||(s[0]=[t(`<h1 id="安徽机房" tabindex="-1">安徽机房 <a class="header-anchor" href="#安徽机房" aria-label="Permalink to &quot;安徽机房&quot;">​</a></h1><h2 id="安徽机房功能梳理" tabindex="-1">安徽机房功能梳理 <a class="header-anchor" href="#安徽机房功能梳理" aria-label="Permalink to &quot;安徽机房功能梳理&quot;">​</a></h2><h3 id="能耗统计" tabindex="-1">能耗统计 <a class="header-anchor" href="#能耗统计" aria-label="Permalink to &quot;能耗统计&quot;">​</a></h3><p><strong>1. 定时采集与落库（用电统计主链）</strong> 入口是 EnergyStatisticsTask.java (line 68)，每小时整点跑一次。流程是：先按设备类型拆两批设备（配电 54，IT 50/53）EnergyStatisticsTask.java (line 73)，月初零点先归档上月数据 EnergyStatisticsTask.java (line 80)，再并发调用服务采集 EnergyStatisticsTask.java (line 86)。</p><p>单设备采集在 ElectricityServiceImpl.java (line 265)：</p><ul><li>配电取点位“组合有功总电能”，IT取两路进线累计点位 ElectricityServiceImpl.java (line 95)。</li><li>从 df_jk_yc 取最新点位，按点位名去重并汇总成当前累计电能快照（totalEnergy + collectTime）ElectricityServiceImpl.java (line 363)。</li><li>增量电量 = currentTotal - lastTotal，负值直接置 0 ElectricityServiceImpl.java (line 509)。</li><li>周期判断用“上次采集日期 vs 本次采集日期”计算跨天/跨周/跨月（不再依赖 hour==0）ElectricityServiceImpl.java (line 751)。</li><li>日序列是固定 24 槽，按采集小时写到对应索引 ElectricityServiceImpl.java (line 537)。</li><li>周/月序列存“当天累计值”，跨天先补槽，再回写最后一个槽位 ElectricityServiceImpl.java (line 342)。</li></ul><p>月归档逻辑在 EnergyStatisticsTask.java (line 99)：取 df_electricity_statistics 当前 energy_monthly_kwh 求和，写入 his_rack_statistics。</p><p><strong>2. 用电量查询（getElectricityStatistics）</strong> 查询入口在 ElectricityServiceImpl.java (line 196)。按机房取 df_electricity_statistics 所有设备后：</p><ul><li>dailyElectricity：把各设备 energy_daily_kwh 按索引求和，再裁剪到“当天 0 点到当前时刻” ElectricityServiceImpl.java (line 225)。</li><li>weeklyElectricity：按索引求和后裁剪到“周一到前一天” ElectricityServiceImpl.java (line 228)。</li><li>monthlyElectricity：按索引求和后裁剪到“每月1号到前一天” ElectricityServiceImpl.java (line 231)。</li><li>同时返回 lastMonthlyElectricity（上月序列）和 monthlyCurrentElectricity（本月累计）ElectricityServiceImpl.java (line 234)。</li></ul><p><strong>3. PUE 查询（getEnergyStatistics）</strong> PUE 查询入口在 ElectricityServiceImpl.java (line 125)。</p><ul><li>分子（总电）取设备类型 54，分母（IT电）取 50/53 ElectricityServiceImpl.java (line 137)。</li><li>当前 pue 用 last_total_energy_kwh 汇总计算：pue = totalLastTotal / itLastTotal ElectricityServiceImpl.java (line 155)。</li><li>趋势 daily/weekly/monthlyPueTrend 是先把两类设备序列按索引汇总，再逐点 total/it 计算，并按时间窗口裁剪 ElectricityServiceImpl.java (line 145) ElectricityServiceImpl.java (line 449)。</li></ul><p>核心上，当前系统是“双口径并存”：</p><ul><li>当前值（瞬时）看 last_total_energy_kwh；</li><li>趋势看日/周/月字符串序列。</li></ul><h3 id="数据采集-告警-短信流程" tabindex="-1">数据采集-告警-短信流程 <a class="header-anchor" href="#数据采集-告警-短信流程" aria-label="Permalink to &quot;数据采集-告警-短信流程&quot;">​</a></h3><div class="language-mermaid vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">mermaid</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">flowchart TD</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  A[&quot;定时任务触发&quot;] --&gt; B{&quot;每5分钟主采集?&quot;}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  A --&gt; C{&quot;每1分钟恢复扫描?&quot;}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  B --&gt; D[&quot;加载设备与映射信息&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  D --&gt; E[&quot;逐设备采集YC/YX实时值&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  E --&gt; F{&quot;点位异常且Redis无该点位上下文?&quot;}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  F --&gt;|&quot;否&quot;| G[&quot;继续下一点位&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  F --&gt;|&quot;是&quot;| H1[&quot;计算等级与告警内容&quot;]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  H1[&quot;计算等级与告警内容&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  H1 --&gt; H2[&quot;插入告警记录到数据库&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  H2 --&gt; H3[&quot;创建值班任务&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  H3 --&gt; H4[&quot;告警推送前端&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  H4 --&gt; H5{&quot;紧急或者重要告警且enableAlarm=1?&quot;}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  H5 --&gt;|&quot;是&quot;| H6[&quot;写Redis  状态：待观察(state=WAITING_5_MIN) deadline=+5min&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  H5 --&gt;|&quot;否&quot;| H7[&quot;不写待观察上下文&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  H6 --&gt; G</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  H7 --&gt; G</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  G --&gt; I[&quot;打印五分钟采集告警统计&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  I --&gt; J[&quot;handleTimeoutAlarmSms&quot;]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  J --&gt; J1[&quot;扫描Redis待观察key&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  J1 --&gt; J2{&quot;抢点位短锁成功?&quot;}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  J2 --&gt;|&quot;否&quot;| J1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  J2 --&gt;|&quot;是&quot;| J3{&quot;state=WAITING_5_MIN 且 已到deadline?&quot;}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  J3 --&gt;|&quot;否&quot;| J1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  J3 --&gt;|&quot;是&quot;| J4{&quot;告警记录存在且未处理?&quot;}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  J4 --&gt;|&quot;否&quot;| J5[&quot;清理Redis上下文&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  J4 --&gt;|&quot;是&quot;| J6{&quot;enableAlarm=1?&quot;}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  J6 --&gt;|&quot;是&quot;| J7[&quot;发送告警短信&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  J7 --&gt; J8[&quot;state-&gt;ALARM_SENT 并设置过期时间&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  J6 --&gt;|&quot;否&quot;| J9[&quot;不发短信 但state-&gt;ALARM_SENT并设置过期时间&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  J5 --&gt; J1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  J8 --&gt; J1</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  J9 --&gt; J1</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  J1 --&gt; K[&quot;打印五分钟短信统计&quot;]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  C --&gt; L[&quot;scanPendingAlarmTask 扫描Redis中的告警点位&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  L --&gt; M{&quot;点位当前值已恢复?&quot;}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  M --&gt;|&quot;否&quot;| L</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  M --&gt;|&quot;是&quot;| N[&quot;triggerRestoreAlarm处理点位恢复逻辑&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  N --&gt; N1{&quot;抢点位短锁成功?&quot;}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  N1 --&gt;|&quot;否&quot;| L</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  N1 --&gt;|&quot;是&quot;| N2[&quot;更新告警为已处理&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  N2 --&gt; N3{&quot;点位允许发送短信?&quot;}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  N3 --&gt;|&quot;是&quot;| N4[&quot;发送恢复短信&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  N3 --&gt;|&quot;否&quot;| N5[&quot;跳过恢复短信&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  N4 --&gt; N6[&quot;删除Redis上下文&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  N5 --&gt; N6</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  N6 --&gt; N7[&quot;删除值班任务&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  N7 --&gt; L</span></span></code></pre></div><h3 id="短信发送" tabindex="-1">短信发送 <a class="header-anchor" href="#短信发送" aria-label="Permalink to &quot;短信发送&quot;">​</a></h3><div class="language-mermaid vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">mermaid</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">flowchart TD</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  A[&quot;进入 sendNotification / sendRestoreNotification&quot;] --&gt; B[&quot;查询接收人: duty_person where msg_all=1&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  B --&gt; C{&quot;遍历每个接收人&quot;}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  C --&gt; D{&quot;人员状态是否可发?\\nisOn=1 且 isSendmsg=1\\n(恢复短信分支当前只严格校验 isOn)&quot;}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  D --&gt;|否| E[&quot;记录日志: 跳过该接收人&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  D --&gt;|是| F{&quot;发送告警短信还是恢复短信?&quot;}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  F --&gt;|告警短信| G[&quot;buildAlarmSmsEntity:\\n填充时间/等级/手机号邮箱/短信内容&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  F --&gt;|恢复短信| H[&quot;buildRestoreSmsEntity:\\n填充恢复时间/等级/恢复值/手机号邮箱/短信内容&quot;]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  G --&gt; I[&quot;ObjectMapper转JSON报文&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  H --&gt; I</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  I --&gt; J[&quot;UdpUtils.sendUdpData(ip,port,msg) 发送到短信网关&quot;]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  J --&gt; K{&quot;发送是否异常?&quot;}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  K --&gt;|否| L[&quot;记录发送成功日志(当前只体现在前置info日志)&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  K --&gt;|是| M[&quot;记录error日志: 发送失败&quot;]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  E --&gt; C</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  L --&gt; C</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  M --&gt; C</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  C --&gt; N{&quot;还有下一个接收人?&quot;}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  N --&gt;|是| C</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  N --&gt;|否| O[&quot;结束&quot;]</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  subgraph &quot;关键内容组装&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    P[&quot;fillCommonSmsFields:\\nphone/mail/sms/ismail/isphone/ismessage&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Q[&quot;utf8String:\\n短信内容转16进制字符串&quot;]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  end</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  G --&gt; P</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  H --&gt; P</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  G --&gt; Q</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  H --&gt; Q</span></span></code></pre></div><h2 id="安徽机房项目踩坑" tabindex="-1">安徽机房项目踩坑 <a class="header-anchor" href="#安徽机房项目踩坑" aria-label="Permalink to &quot;安徽机房项目踩坑&quot;">​</a></h2><h3 id="jsonformat注解在beanutils-copyproperties-方法中会失效" tabindex="-1">@JsonFormat注解在BeanUtils.copyProperties()方法中会失效 <a class="header-anchor" href="#jsonformat注解在beanutils-copyproperties-方法中会失效" aria-label="Permalink to &quot;@JsonFormat注解在BeanUtils.copyProperties()方法中会失效&quot;">​</a></h3><h5 id="核心原理" tabindex="-1">核心原理： <a class="header-anchor" href="#核心原理" aria-label="Permalink to &quot;核心原理：&quot;">​</a></h5><p>让我们来解析一下两个工具的工作机制：</p><ul><li><strong>@JsonFormat 的工作方式</strong>：它的功能由 Jackson 库实现。只有当您使用 <code>ObjectMapper</code>（如 <code>objectMapper.writeValueAsString(obj)</code>）将对象序列化为 JSON 字符串时，Jackson 才会去读取这个注解，并按照您指定的 <code>pattern</code>（如 <code>yyyy-MM-dd HH:mm:ss</code>）来格式化时间字段。</li><li><strong>BeanUtils.copyProperties() 的工作方式</strong>：这个方法通过 Java 反射机制工作。它会找到源对象和目标对象中<strong>同名的属性</strong>，然后调用属性的 <code>getXxx()</code> 方法从源对象读取值，再调用 <code>setXxx()</code> 方法将值写入目标对象。这个过程完全是内存中的字段值拷贝，<strong>既不涉及 JSON 转换，也不会检查和解析任何 Jackson 相关的注解</strong>。</li></ul>`,22)])])}const u=a(l,[["render",e]]);export{c as __pageData,u as default};
