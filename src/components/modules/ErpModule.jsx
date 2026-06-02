import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ModuleShell from './ModuleShell';
import ErpDashboard from './erp/ErpDashboard';
import StaffManager from './erp/StaffManager';
import RoleManager from './erp/RoleManager';

/**
 * ERP module: global dashboard, staff management and roles/permissions.
 */
const ERP_TABS = [
    { label: 'General', path: '/erp' },
    { label: 'Personal', path: '/erp/personal' },
    { label: 'Roles', path: '/erp/roles' },
];

const ErpModule = () => (
    <ModuleShell title="ERP" subtitle="Enterprise Resource Planning" tabs={ERP_TABS}>
        <Routes>
            <Route index element={<ErpDashboard />} />
            <Route path="personal" element={<StaffManager />} />
            <Route path="roles" element={<RoleManager />} />
            <Route path="*" element={<Navigate to="/erp" replace />} />
        </Routes>
    </ModuleShell>
);

export default ErpModule;
