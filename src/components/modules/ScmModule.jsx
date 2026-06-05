import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ModuleShell from './ModuleShell';
import InventoryManager from './scm/InventoryManager';
import SupplierManager from './scm/SupplierManager';
import ShippingManager from './scm/ShippingManager';
import ProductManager from './scm/ProductManager';

/**
 * SCM module: inventory, suppliers, products and shipping logistics.
 */
const SCM_TABS = [
    { label: 'Catálogo', path: '/scm/catalogo' },
    { label: 'Inventario', path: '/scm/inventario' },
    { label: 'Proveedores', path: '/scm/proveedores' },
    { label: 'Envios', path: '/scm/envios' },
];

const ScmModule = () => (
    <ModuleShell title="SCM" subtitle="Supply Chain Management" tabs={SCM_TABS}>
        <Routes>
            <Route index element={<Navigate to="/scm/catalogo" replace />} />
            <Route path="catalogo" element={<ProductManager />} />
            <Route path="inventario" element={<InventoryManager />} />
            <Route path="proveedores" element={<SupplierManager />} />
            <Route path="envios" element={<ShippingManager />} />
            <Route path="*" element={<Navigate to="/scm/catalogo" replace />} />
        </Routes>
    </ModuleShell>
);

export default ScmModule;
