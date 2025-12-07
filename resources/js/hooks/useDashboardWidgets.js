import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, isAfter, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const WIDGET_ENDPOINTS = {
    employeeStatuses: { url: route('api.v1.admin.dashboard.employee-statuses'), name: 'employee-statuses' },
    activeUsers: { url: route('api.v1.admin.dashboard.active-users-count'), name: 'active-users-count' },
    justificationsStats: { url: route('api.v1.admin.dashboard.justification-stats'), name: 'justification-stats' },
    employeesByDepartment: { url: route('api.v1.admin.dashboard.employees-by-department-stats'), name: 'employees-by-department-stats' },
    clockingsStats: { url: route('api.v1.admin.dashboard.clocking-stats'), name: 'clocking-stats' },
    pendingVacations: { url: route('api.v1.admin.dashboard.pending-vacation-stats'), name: 'pending-vacation-stats' },
    pendingPermissions: { url: route('api.v1.admin.dashboard.pending-permission-stats'), name: 'pending-permission-stats' },
    expiringContracts: { url: route('api.v1.admin.dashboard.expiring-contracts-stats'), name: 'expiring-contracts-stats' },
    expiringDocuments: { url: route('api.v1.admin.dashboard.expiring-documents-stats'), name: 'expiring-documents-stats' },
    newEmployees: { url: route('api.v1.admin.dashboard.new-employees-stats'), name: 'new-employees-stats' },
};

export const useDashboardWidgets = () => {
    const [widgetsData, setWidgetsData] = useState({
        employeeStatuses: null,
        activeUsers: { connected_count: 0, total_active: 0 },
        justificationsStats: { weekly_stats: [], older_pending_count: 0, total_pending_count: 0 },
        employeesByDepartment: { stats: [] },
        clockingsStats: { summary: {}, by_hour: {} },
        pendingVacations: { weekly_stats: [], older_pending_count: 0, total_pending_count: 0 },
        pendingPermissions: { total_pending: 0, older_pending_count: 0, breakdown: [] }
    });
    const [currentDate, setCurrentDate] = useState('');
    const [connectedUsersCount, setConnectedUsersCount] = useState(0);

    useEffect(() => {
        setCurrentDate(format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }));

        Object.entries(WIDGET_ENDPOINTS).forEach(([key, { url }]) => {
            axios.get(url)
                .then(response => setWidgetsData(prev => ({ ...prev, [key]: response.data })))
                .catch(err => console.error(`Error fetching ${key}:`, err));
        });

        const dashboardChannel = window.Echo.private('dashboard');

        dashboardChannel.listen('.widget.updated', (event) => {
            const { widgetName, widgetData } = typeof event === 'string' ? JSON.parse(event) : event;
            const widgetKey = Object.keys(WIDGET_ENDPOINTS).find(key => WIDGET_ENDPOINTS[key].name === widgetName);

            if (!widgetKey || !widgetData.type) return;
            
            toast.info(`Actualización en vivo para: ${widgetName}`);

            setWidgetsData(prev => {
                const newWidgetsData = { ...prev };
                const type = widgetData.type;

                // --- MANEJADORES DELTA ---

                if (type === 'update' && widgetKey === 'employeeStatuses') {
                    if (!newWidgetsData.employeeStatuses) return prev;
                    const updatedStatuses = { ...newWidgetsData.employeeStatuses };
                    for (const group in updatedStatuses) {
                        if (updatedStatuses[group]?.employees) {
                            updatedStatuses[group].employees = updatedStatuses[group].employees.filter(e => e.id !== widgetData.employee_id);
                            updatedStatuses[group].count = updatedStatuses[group].employees.length;
                        }
                    }
                    const targetGroup = updatedStatuses[widgetData.group];
                    if (targetGroup) {
                        targetGroup.employees.push(widgetData.status);
                        targetGroup.count = targetGroup.employees.length;
                        }
                    newWidgetsData.employeeStatuses = updatedStatuses;
                }

                else if (type === 'expiring_item_delta') {
                    const targetKey = widgetData.widget_name === 'expiring-contracts-stats' ? 'expiringContracts' : 'expiringDocuments';
                    const data = JSON.parse(JSON.stringify(newWidgetsData[targetKey])); // Deep copy
                    const listKey = 'expiring_soon_list';
                    const countsKey = 'expiring_in_days_counts';

                    if (widgetData.decrement) data[countsKey][widgetData.decrement]--;
                    if (widgetData.increment) data[countsKey][widgetData.increment]++;

                    let list = data[listKey] ? [...data[listKey]] : [];
                    
                    if(widgetData.item_id_to_remove) {
                        list = list.filter(item => item.id !== widgetData.item_id_to_remove);
                    }
                    if(widgetData.item_to_add) {
                        list.push(widgetData.item_to_add);
                    }
                    if(widgetData.item_to_update) {
                        const index = list.findIndex(item => item.id === widgetData.item_to_update.id);
                        if(index !== -1) list[index] = widgetData.item_to_update;
                        else list.push(widgetData.item_to_update); // Si no estaba en la lista, lo añadimos
                    }

                    list.sort((a, b) => (a.dias_restantes ?? 9999) - (b.dias_restantes ?? 9999));
                    data[listKey] = list.slice(0, 5); // Aseguramos que la lista no crezca indefinidamente

                    newWidgetsData[targetKey] = data;
                }
                
                else if (type === 'new_employee_add' || type === 'new_employee_remove') {
                    const data = JSON.parse(JSON.stringify(newWidgetsData.newEmployees));
                    const change = type === 'new_employee_add' ? 1 : -1;
                    data.new_employee_count = Math.max(0, data.new_employee_count + change);
                    
                    let list = data.new_employees_list ? [...data.new_employees_list] : [];

                    if (type === 'new_employee_add') {
                        list.unshift(widgetData.details); // Añadir al principio
                    } else { // remove
                        list = list.filter(item => item.id !== widgetData.id);
                    }

                    data.new_employees_list = list.slice(0, 10);
                    newWidgetsData.newEmployees = data;
                }

                else if (type.startsWith('active_users_')) {
                    const currentTotal = newWidgetsData.activeUsers?.total_active ?? 0;
                    newWidgetsData.activeUsers.total_active = type === 'active_users_increment' ? currentTotal + 1 : Math.max(0, currentTotal - 1);
                }

                else if (type === 'vacation_delta') {
                    const { date, change, total_pending_count } = widgetData;
                    const data = JSON.parse(JSON.stringify(newWidgetsData.pendingVacations));
                    
                    // CORRECCIÓN: Usar 'weekly_stats' que es la clave correcta.
                    const datePoint = data.weekly_stats.find(d => d.date === date);
                    if (datePoint) {
                        datePoint.count = Math.max(0, datePoint.count + change);
                    } else if (change > 0) {
                        data.weekly_stats.push({ date: date, count: 1 });
                        data.weekly_stats.sort((a, b) => new Date(a.date) - new Date(b.date));
                    }

                    // Aseguramos que el total exista antes de asignarlo
                    if (total_pending_count !== undefined) {
                        newWidgetsData.pendingVacations = {
                            ...data,
                            total_pending_count: total_pending_count,
                        };
                    }
                }

                else if (type === 'permission_delta') {
                    // CORRECCIÓN: Leer 'total_pending' del payload.
                    const { permission_name, change, total_pending } = widgetData;
                    const data = JSON.parse(JSON.stringify(newWidgetsData.pendingPermissions));
                    
                    const breakdown = data.breakdown ? [...data.breakdown] : [];
                    const permissionType = breakdown.find(p => p.name === permission_name);
                    
                    if (permissionType) {
                        permissionType.count = Math.max(0, permissionType.count + change);
                    } else if (change > 0) {
                        breakdown.push({ name: permission_name, count: 1 });
                        breakdown.sort((a,b) => a.name.localeCompare(b.name));
                    }
                    data.breakdown = breakdown.filter(p => p.count > 0);
                    
                    // CORRECCIÓN: Actualizar el contador total con el valor del backend.
                    if (total_pending !== undefined) {
                        data.total_pending = total_pending;
                    }
                    newWidgetsData.pendingPermissions = data;
                }

                else if (type.startsWith('justification_')) {
                    const stats = { ...newWidgetsData.justificationsStats };
                    const change = type === 'justification_add' ? 1 : -1;
                    const dateIsRecent = isAfter(new Date(widgetData.date), subDays(new Date(), 7));
                    
                    stats.total_pending_count = Math.max(0, stats.total_pending_count + change);
                    if (dateIsRecent) {
                        const dayStat = stats.weekly_stats.find(d => d.date === widgetData.date);
                        if(dayStat) dayStat.count = Math.max(0, dayStat.count + change);
                    } else {
                        stats.older_pending_count = Math.max(0, stats.older_pending_count + change);
                    }
                    newWidgetsData.justificationsStats = stats;
                }
                
                else if (type === 'clocking_add') {
                    const stats = JSON.parse(JSON.stringify(newWidgetsData.clockingsStats)); // deep copy
                    stats.summary.clocked_in_count++;
                    const hour = widgetData.hour.toString().padStart(2, '0');
                    if(stats.by_hour[hour]) {
                        stats.by_hour[hour].total++;
                        stats.by_hour[hour].devices[widgetData.device]++;
            }
                    newWidgetsData.clockingsStats = stats;
                }

                else if (type === 'department_delta') {
                    const stats = newWidgetsData.employeesByDepartment?.stats ? [...newWidgetsData.employeesByDepartment.stats] : [];
                    const { increment, decrement } = widgetData;
                    if (decrement) {
                        const dept = stats.find(d => d.department_name === decrement);
                        if (dept) dept.employee_count = Math.max(0, dept.employee_count - 1);
                    }
                    if (increment) {
                        const dept = stats.find(d => d.department_name === increment);
                        if (dept) dept.employee_count++;
                        else stats.push({ department_name: increment, employee_count: 1 });
            }
                    newWidgetsData.employeesByDepartment = { stats };
                }
                
                return newWidgetsData;
            });
        });

        const presenceChannel = window.Echo.join('presence-app');
        presenceChannel
            .here(users => setConnectedUsersCount(users.length))
            .joining(() => setConnectedUsersCount(prev => prev + 1))
            .leaving(() => setConnectedUsersCount(prev => prev - 1))
            .error(err => console.error("Error en el canal de presencia:", err));

        return () => {
            dashboardChannel.stopListening('.widget.updated');
            window.Echo.leave('presence-app');
        };
    }, []);

    return { widgetsData, currentDate, connectedUsersCount };
};
