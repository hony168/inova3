import request from '../utils/request';


//登陆
export const login = (query) => {
    return request({
        url: '/erpv9/Member/login',
        method: 'post',
        data: query
    })
};

//删除会员信息
export const batchDelUser = (query) => {
    return request({
        url: '/erpv9/Member/batchDelUser',
        method: 'post',
        data: query
    })
};
//获取会员信息
export const userlist = (query) => {
    return request({
        url: '/erpv9/Member/userlist',
        method: 'post',
        data: query
    })
};

//增加会员信息
export const AddUser = (query) => {
    return request({
        url: '/erpv9/Member/AddUser',
        method: 'post',
        data: query
    })
};

//修改会员密码
export const userEditPass = (query) => {
    return request({
        url: '/erpv9/Member/userEditPass',
        method: 'post',
        data: query
    })
};

//修改会员信息
export const userEdit = (query) => {
    return request({
        url: '/erpv9/Member/userEdit',
        method: 'post',
        data: query
    })
};

//查询物料备信息
export const parts = (query) => {
    return request({
        url: '/erp/Part/parts',
        method: 'post',
        data: query
    })
};

//查询物料分类信息
export const PartGetType = (query) => {
    return request({
        url: '/erp/Part/PartGetType',
        method: 'post',
        data: query
    })
};


 //查询销售员信息
export const seaStaff = (query) => {
    return request({
        url: '/erpv9/Member/seaStaff',
        method: 'post',
        data: query
    })
};
//查询客户信息
export const seaContact = (query) => {
    return request({
        url: '/erpv9/Member/seaContact',
        method: 'post',
        data: query
    })
};


//修改物料
export const eidtPart = (query) => {
    return request({
        url: '/erp/Part/eidtPart',
        method: 'post',
        data: query
    })
};

//批量删除物料
export const batchDelParts = (query) => {
    return request({
        url: '/erp/Part/batchDelParts',
        method: 'post',
        data: query
    })
};






//查询导航信息
export const sOnePart = (query) => {
    return request({
        url: '/erp/DAta/sOnePart',
        method: 'post',
        data: query
    })
};
//查询导航信息
export const fetchNavData = (query) => {
    return request({
        url: '/gas/Member/NavMenu',
        method: 'post',
        data: query
    })
};
//增加设备
export const addMac = (query) => {
    return request({
        url: '/gas/Mac/AddMac',
        method: 'post',
        data: query
    })
};
//批量增加设备
export const batchAddMac = (query) => {
    return request({
        url: '/gas/Mac/batchAddMac',
        method: 'post',
        data: query
    })
};


//查询公司列表
export const coSelect = (query) => {
    return request({
        url: '/gas/Company/coSelect',
        method: 'post',
        data: query
    })
};
//查询设备型号列表
export const macTypeSelect = (query) => {
    return request({
        url: '/gas/Mac/macTypeSelect',
        method: 'post',
        data: query
    })
};
//增加设备分类
export const AddMacPsort = (query) => {
    return request({
        url: '/gas/Mac/AddMacPsort',
        method: 'post',
        data: query
    })
};

//删除设备分类
export const DelMacPsort = (query) => {
    return request({
        url: '/gas/Mac/DelMacPsort',
        method: 'post',
        data: query
    })
};

//修改设备分类
export const EditMacPsort = (query) => {
    return request({
        url: '/gas/Mac/EditMacPsort',
        method: 'post',
        data: query
    })
};

//查询设备分类
export const selectMacPsort = (query) => {
    return request({
        url: '/gas/Mac/selectMacPsort',
        method: 'post',
        data: query
    })
};

//查询设备型号
export const selectMacType = (query) => {
    return request({
        url: '/gas/Mac/selectMacType',
        method: 'post',
        data: query
    })
};
//增加设备型号
export const AddMacType = (query) => {
    return request({
        url: '/gas/Mac/AddMacType',
        method: 'post',
        data: query
    })
};
//删除设备型号
export const DelMacType = (query) => {
    return request({
        url: '/gas/Mac/DelMacType',
        method: 'post',
        data: query
    })
};
//设备型号图样上传
export const upimg = (query) => {
    return request({
        url: '/gas/Mac/upimg',
        method: 'post',
        data: query
    })
};


