-- Beijing Safety Production Supervision Platform (Phase II)
-- Table prefix: bsb_
-- Runtime: client-side sql.js (seeded .sqlite); D1 schema for architecture reference.

CREATE TABLE IF NOT EXISTS bsb_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    org_name TEXT,
    role TEXT CHECK(role IN ('SuperAdmin', 'SafetyInspector', 'EnterpriseUser', 'Viewer')) DEFAULT 'Viewer',
    phone TEXT,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bsb_system_configs (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS bsb_enterprises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    credit_code TEXT UNIQUE,
    address TEXT,
    district TEXT,
    industry_type TEXT,
    safety_level TEXT CHECK(safety_level IN ('High', 'Medium', 'Low')),
    contact_name TEXT,
    contact_phone TEXT,
    location_lat REAL,
    location_lng REAL,
    safety_index REAL DEFAULT 80,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bsb_hidden_dangers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enterprise_id INTEGER,
    reporter_id INTEGER,
    title TEXT,
    description TEXT NOT NULL,
    severity TEXT CHECK(severity IN ('Critical', 'Major', 'General')) DEFAULT 'General',
    status TEXT CHECK(status IN ('Reported', 'Assigned', 'Rectifying', 'Verified', 'Closed')) DEFAULT 'Reported',
    location_lat REAL,
    location_lng REAL,
    deadline TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(enterprise_id) REFERENCES bsb_enterprises(id),
    FOREIGN KEY(reporter_id) REFERENCES bsb_users(id)
);

CREATE TABLE IF NOT EXISTS bsb_inspections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enterprise_id INTEGER,
    inspector_id INTEGER,
    check_type TEXT,
    result TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(enterprise_id) REFERENCES bsb_enterprises(id),
    FOREIGN KEY(inspector_id) REFERENCES bsb_users(id)
);

CREATE TABLE IF NOT EXISTS bsb_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    action_name TEXT NOT NULL,
    request_uri TEXT,
    status_code INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed users (password_hash = MD5)
-- admin / admin123
-- inspector01 / pass1234
-- ent_user01 / pass1234
INSERT INTO bsb_users (username, password_hash, full_name, org_name, role, phone) VALUES
('admin', '0192023a7bbd73250516f069df18b500', '系统管理员', '北京市应急管理局', 'SuperAdmin', '010-12345678'),
('inspector01', 'b4af804009cb036a4ccdc33431ef9ac9', '张巡查', '朝阳区应急管理局', 'SafetyInspector', '13800001111'),
('ent_user01', 'b4af804009cb036a4ccdc33431ef9ac9', '李安管', '示例危化企业A', 'EnterpriseUser', '13900002222'),
('viewer01', 'b4af804009cb036a4ccdc33431ef9ac9', '公众观察员', '京办演示', 'Viewer', NULL);

INSERT INTO bsb_system_configs (key, value, description) VALUES
('site_title', 'Beijing Safety Platform', 'Global site title'),
('maintenance_mode', 'false', 'Enable maintenance mode'),
('jingban_mobile_enabled', 'true', '京办移动端入口开关'),
('jingban_pc_enabled', 'true', '京办PC端入口开关'),
('one_map_realtime', 'true', '一张图实时推送模拟'),
('ai_assist_enabled', 'true', 'AI辅助人员模块开关');

INSERT INTO bsb_enterprises (name, credit_code, address, district, industry_type, safety_level, contact_name, contact_phone, location_lat, location_lng, safety_index) VALUES
('北京示例危化仓储有限公司', '91110105MA00DEMO01', '朝阳区酒仙桥路88号', '朝阳区', '危化品', 'High', '王安全', '13610001001', 39.9778, 116.4972, 72.5),
('京西工贸制造股份有限公司', '91110108MA00DEMO02', '海淀区中关村南大街5号', '海淀区', '工贸', 'Medium', '赵主管', '13610001002', 39.9592, 116.3160, 85.2),
('首都建设施工集团第三分公司', '91110106MA00DEMO03', '丰台区南四环西路128号', '丰台区', '建筑施工', 'High', '孙项目', '13610001003', 39.8450, 116.2875, 68.8),
('通州智慧物流园运营中心', '91110112MA00DEMO04', '通州区潞苑南大街66号', '通州区', '仓储物流', 'Low', '周仓管', '13610001004', 39.9120, 116.6570, 91.3),
('大兴生物医药产业园B区', '91110115MA00DEMO05', '大兴区永兴路12号', '大兴区', '医药制造', 'Medium', '吴药安', '13610001005', 39.7265, 116.3380, 88.0),
('顺义燃气输配站', '91110113MA00DEMO06', '顺义区空港工业园', '顺义区', '燃气', 'High', '郑站长', '13610001006', 40.0805, 116.5948, 75.6),
('昌平矿山机械检修厂', '91110114MA00DEMO07', '昌平区回龙观西大街', '昌平区', '工贸', 'Medium', '冯厂长', '13610001007', 40.0708, 116.3265, 82.1),
('房山非煤矿山示范点', '91110111MA00DEMO08', '房山区长阳镇工业园', '房山区', '非煤矿山', 'High', '陈矿长', '13610001008', 39.7630, 116.1340, 70.4);

INSERT INTO bsb_hidden_dangers (enterprise_id, reporter_id, title, description, severity, status, location_lat, location_lng, deadline) VALUES
(1, 2, '危化库区消防通道占用', '库区东侧消防通道被临时货柜占用，影响应急通行。', 'Critical', 'Assigned', 39.9778, 116.4972, '2026-09-20'),
(1, 3, '气体探测器校准超期', '罐区可燃气体探测器超期未校准。', 'Major', 'Rectifying', 39.9780, 116.4975, '2026-09-25'),
(2, 2, '冲压车间防护栏缺失', '3号产线冲压机防护栏局部缺失。', 'Major', 'Reported', 39.9592, 116.3160, '2026-09-18'),
(3, 2, '临边防护不到位', '塔吊作业区临边防护网破损。', 'Critical', 'Rectifying', 39.8450, 116.2875, '2026-09-15'),
(3, 2, '施工电梯限位器异常', '电梯上限位器间歇失灵，已停用待检。', 'Major', 'Verified', 39.8452, 116.2878, '2026-09-12'),
(4, 3, '叉车通道标识模糊', '装卸区叉车通道地面标识磨损严重。', 'General', 'Closed', 39.9120, 116.6570, '2026-08-30'),
(6, 2, '调压柜周边杂物堆积', '一级调压柜周边堆放可燃杂物。', 'Critical', 'Assigned', 40.0805, 116.5948, '2026-09-16'),
(8, 2, '边坡监测点离线', '南侧边坡位移监测设备连续离线24小时。', 'Major', 'Reported', 39.7630, 116.1340, '2026-09-22');

INSERT INTO bsb_inspections (enterprise_id, inspector_id, check_type, result, notes) VALUES
(1, 2, '专项检查', '发现问题', '发现2处重大隐患，已下达整改通知'),
(2, 2, '日常巡查', '基本合格', '建议完善车间防护设施'),
(3, 2, '突击检查', '发现问题', '临边防护需立即整改'),
(4, 2, '双随机', '合格', '现场管理规范'),
(6, 2, '专项检查', '发现问题', '燃气设施周边环境需清理');

INSERT INTO bsb_audit_logs (user_id, username, action_name, request_uri, status_code) VALUES
(1, 'admin', 'SYSTEM_BOOT', '/', 200),
(2, 'inspector01', 'LOGIN_SUCCESS', '/login', 200);
