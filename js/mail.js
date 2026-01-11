const Mailer = {
    DEFAULT_BRIDGE: "https://alive-bridge.alunnb.workers.dev/",
    // 内部实现 SMTP.js 的核心逻辑，避免外部脚本加载失败
    async _send(a) {
        console.group("邮件发送调试 (Mailer Debug)");
        console.log("1. 准备请求数据...", { Host: a.Host, To: a.To, Username: a.Username });

        a.nocache = Math.floor(1e6 * Math.random() + 1);
        a.Action = "Send";
        const data = JSON.stringify(a);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.warn("2. 请求超时 (10s)！");
                controller.abort();
            }, 10000);

            console.log("3. 正在 Fetch 中转接口 (smtpjs.com)...");
            const response = await fetch("https://smtpjs.com/v1/send.ashx", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: data,
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const result = await response.text();
            console.log("4. 服务器原始返回:", result);

            if (result === 'OK') {
                console.log("5. 发送成功！");
                console.groupEnd();
                return result;
            }
            throw new Error(result);
        } catch (err) {
            console.error("X. 发生错误:", err);
            let msg = "无法连接到邮件中转服务器。";
            if (err.name === 'AbortError') msg = "连接超时，中转服务器响应太慢。";
            else if (err.message.includes("Failed to fetch")) msg = "网络被拦截（CORS 或防火墙）。";

            console.groupEnd();
            throw new Error(`发送失败：${msg}\n\n[163/QQ 邮箱特别提醒]：\n1. 必须使用“授权码”（非登录密码），获取路径见设置页提示。\n2. 确保已开启 POP3/SMTP 服务。\n3. 您提供的方案依赖 smtpjs.com 中转，若该服务被拦截，请务必查看 Walkthrough 指南部署“直连网易”的桥接脚本。`);
        }
    },

    SMTP_MAP: {
        'qq.com': 'smtp.qq.com',
        'foxmail.com': 'smtp.qq.com',
        '163.com': 'smtp.163.com',
        '126.com': 'smtp.163.com',
        'yeah.net': 'smtp.163.com',
        '188.com': 'smtp.188.com',
        'aliyun.com': 'smtp.aliyun.com',
        'sina.com': 'smtp.sina.com',
        'sina.cn': 'smtp.sina.com',
        'vip.sina.com': 'smtp.vip.sina.com',
        'sohu.com': 'smtp.sohu.com',
        'tom.com': 'smtp.tom.com',
        '139.com': 'smtp.139.com',
        '189.cn': 'smtp.189.cn',
        'wo.cn': 'smtp.wo.cn',
        '263.net': 'smtp.263.net',
        '263.net.cn': 'smtp.263.net.cn',
        'gmail.com': 'smtp.gmail.com',
        'outlook.com': 'smtp-mail.outlook.com',
        'hotmail.com': 'smtp-mail.outlook.com',
        'live.com': 'smtp-mail.outlook.com',
        'msn.com': 'smtp-mail.outlook.com',
        'icloud.com': 'smtp.mail.me.com',
        'yahoo.com': 'smtp.mail.yahoo.com',
        'aol.com': 'smtp.aol.com',
        'zoho.com': 'smtp.zoho.com'
    },

    getSmtpHost(email) {
        if (!email || !email.includes('@')) return '';
        const domain = email.split('@')[1].trim().toLowerCase();
        return this.SMTP_MAP[domain] || '';
    },

    async sendCheckIn(config) {
        const bridgeUrl = config.bridgeUrl || this.DEFAULT_BRIDGE;

        // 如果没有配置邮箱密码且有桥接，或者由于某种原因想用 API 模式
        if (bridgeUrl && (!config.password || config.apiMode)) {
            console.log("检测到 API 模式或未配置密码，尝试直接 Ping 桥接...");
            try {
                return await this.sendPulse(bridgeUrl);
            } catch (err) {
                console.warn("API Ping 失败，尝试传统邮件流程...", err);
            }
        }

        if (bridgeUrl) {
            try {
                return await this.sendViaBridge({ ...config, bridgeUrl });
            } catch (err) {
                console.warn("桥接发送失败，尝试使用传统 SMTP (smtpjs)...", err);
            }
        }

        const host = config.smtpHost || this.getSmtpHost(config.email);
        if (!host) throw new Error("无法自动识别 SMTP 服务器，请在设置中手动输入");

        return await this._send({
            Host: host,
            Username: config.email,
            Password: config.password,
            To: config.targetEmail,
            From: config.email,
            Subject: "【活着】存活确认邮件",
            Body: `这是一封由“活着”应用自动生成的确认邮件。\n签到时间：${new Date().toLocaleString()}\n来自：${config.email}`
        });
    },

    async sendPulse(url) {
        console.log("正在通过 API 签到...");
        const response = await fetch(`${url}?action=ping`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        const result = await response.text();
        if (result === 'OK' || result.includes('OK')) return 'OK';
        throw new Error(result || "API 响应错误");
    },

    async sendViaBridge(config) {
        if (!config.bridgeUrl) throw new Error("未配置桥接 URL");

        const url = new URL(config.bridgeUrl);
        url.searchParams.append('action', 'send');
        url.searchParams.append('to', config.targetEmail);
        url.searchParams.append('subject', "【活着】存活确认邮件 (通过桥接)");
        url.searchParams.append('body', `这是一封通过桥接发送的确认邮件。\n签到时间：${new Date().toLocaleString()}\n来自：${config.email}`);

        const response = await fetch(url);
        const result = await response.text();

        if (result === 'OK' || result.includes('OK')) return 'OK';
        throw new Error(result || "桥接服务器返回了未知错误");
    },

    async retrieveStatus(config, sinceDate) {
        const bridgeUrl = config.bridgeUrl || this.DEFAULT_BRIDGE;
        if (!bridgeUrl) throw new Error("未配置“桥接 URL”，无法自动拉取。请手动检查邮箱或配置桥接。");

        const url = new URL(bridgeUrl);
        // 如果是 API 模式（比如链接不含 GAS 特征）或者显式指定
        if (config.apiMode || !bridgeUrl.includes("script.google.com")) {
            url.searchParams.append('action', 'status');
        } else {
            url.searchParams.append('email', config.targetEmail);
            url.searchParams.append('since', sinceDate);
        }

        const response = await fetch(url);
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            return data;
        } else {
            const text = await response.text();
            throw new Error(`桥接返回非 JSON 数据 (可能是 525 错误): ${text.substring(0, 50)}...`);
        }
    }
};
