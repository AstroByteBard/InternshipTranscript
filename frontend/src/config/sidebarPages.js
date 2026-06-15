/**
 * Single source of truth for admin sidebar items and settings page list.
 */

export const ADMIN_PAGES = [
    { pageId: 'Dashboard', title: [{ key: 'en', value: 'Dashboard' }, { key: 'th', value: 'แดชบอร์ด' }] },
    { pageId: 'CorrespondenceStudent', title: [{ key: 'en', value: 'Correspondence - Student' }, { key: 'th', value: 'จดหมาย - นักศึกษา' }] },
    { pageId: 'CorrespondenceAdviser', title: [{ key: 'en', value: 'Correspondence - Adviser' }, { key: 'th', value: 'จดหมาย - อาจารย์ที่ปรึกษา' }] },
    { pageId: 'CompetenciesSoftskill', title: [{ key: 'en', value: 'Soft Skill' }, { key: 'th', value: 'ทักษะทางอ้อม' }] },
    { pageId: 'CompetenciesHardskill', title: [{ key: 'en', value: 'Hard Skill' }, { key: 'th', value: 'ทักษะทางตรง' }] },
    { pageId: 'CompetenciesSuggestions', title: [{ key: 'en', value: 'Suggestions' }, { key: 'th', value: 'ข้อเสนอแนะ' }] },
    { pageId: 'DocumentsDocument', title: [{ key: 'en', value: 'Documents' }, { key: 'th', value: 'เอกสาร' }] },
    { pageId: 'DocumentsCertificate', title: [{ key: 'en', value: 'Certificate' }, { key: 'th', value: 'ใบรับรอง' }] },
    { pageId: 'AdministratorStudent', title: [{ key: 'en', value: 'Administrator - Student' }, { key: 'th', value: 'ผู้ดูแล - นักศึกษา' }] },
    { pageId: 'AdministratorAdviser', title: [{ key: 'en', value: 'Administrator - Adviser' }, { key: 'th', value: 'ผู้ดูแล - อาจารย์ที่ปรึกษา' }] },
    { pageId: 'SettingsGeneral', title: [{ key: 'en', value: 'Settings - General' }, { key: 'th', value: 'การตั้งค่า - ทั่วไป' }] },
];

export const SIDEBAR_NAV_CONFIG = [
    {
        type: 'title',
        sectionKey: 'overview',
        i18nKey: 'overview'
    },
    {
        type: 'item',
        pageId: 'Dashboard',
        i18nKey: 'dashboard',
        to: '/dashboard',
        icon: 'cil-window-restore'
    },
    {
        type: 'title',
        sectionKey: 'main',
        i18nKey: 'main'
    },
    {
        type: 'dropdown',
        i18nKey: 'correspondence',
        route: '/correspondence',
        icon: 'cil-envelope-closed',
        items: [
            { pageId: 'CorrespondenceStudent', i18nKey: 'student', to: '/correspondence/student' },
            { pageId: 'CorrespondenceAdviser', i18nKey: 'adviser', to: '/correspondence/adviser' }
        ]
    },
    {
        type: 'dropdown',
        i18nKey: 'competencies',
        route: '/Competencies',
        icon: 'cil-lightbulb',
        items: [
            { pageId: 'CompetenciesSoftskill', i18nKey: 'soft_skill', to: '/Competencies/softskill' },
            { pageId: 'CompetenciesHardskill', i18nKey: 'hard_skill', to: '/Competencies/hardskill' },
            { pageId: 'CompetenciesSuggestions', i18nKey: 'suggestions', to: '/Competencies/suggestions' }
        ]
    },
    {
        type: 'dropdown',
        i18nKey: 'documents',
        to: '/documents',
        icon: 'cil-description',
        items: [
            { pageId: 'DocumentsDocument', i18nKey: 'document', to: '/documents/document' },
            { pageId: 'DocumentsCertificate', i18nKey: 'certificate', to: '/documents/certificate' }
        ]
    },
    {
        type: 'title',
        sectionKey: 'administrator',
        i18nKey: 'administrator'
    },
    {
        type: 'dropdown',
        i18nKey: 'administrator',
        route: '/administrator',
        icon: 'cil-lightbulb',
        items: [
            { pageId: 'AdministratorStudent', i18nKey: 'student', to: '/administrator/student' },
            { pageId: 'AdministratorAdviser', i18nKey: 'adviser', to: '/administrator/adviser' }
        ]
    },
    {
        type: 'title',
        sectionKey: 'project_shortcuts',
        i18nKey: 'project_shortcuts'
    },
    {
        type: 'dropdown',
        i18nKey: 'settings',
        route: '/project/settings',
        icon: 'cil-settings',
        items: [
            { pageId: 'SettingsGeneral', i18nKey: 'general', routeName: 'ProjectSettingsGeneral', pathSuffix: 'settings/general' }
        ]
    }
];
