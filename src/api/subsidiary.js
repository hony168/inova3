import request from '../utils/request';


//查询仓库列表
export const locationAllList = (query) => {
    return request({
        url: '/erpv9/Subsidiary/locationAllList',
        method: 'post',
        data: query
    })
};

//增加仓库信息
export const addLocation = (query) => {
    return request({
        url: '/erpv9/Subsidiary/addLocation',
        method: 'post',
        data: query
    })
};

//编辑仓库信息
export const editLocation = (query) => {
    return request({
        url: '/erpv9/Subsidiary/editLocation',
        method: 'post',
        data: query
    })
};

//删除仓库信息
export const delLocation = (query) => {
    return request({
        url: '/erpv9/Subsidiary/delLocation',
        method: 'post',
        data: query
    })
};

//删除商品分类信息
export const delTradeClass = (query) => {
    return request({
        url: '/erpv9/Subsidiary/delTradeClass',
        method: 'post',
        data: query
    })
};

//查询计量单位列表
export const unitAllList = (query) => {
    return request({
        url: '/erpv9/Subsidiary/unitAllList',
        method: 'post',
        data: query
    })
};

//增加计量单位信息
export const addUnit = (query) => {
    return request({
        url: '/erpv9/Subsidiary/addUnit',
        method: 'post',
        data: query
    })
};

//编辑计量单位信息
export const editUnit = (query) => {
    return request({
        url: '/erpv9/Subsidiary/editUnit',
        method: 'post',
        data: query
    })
};

//删除计量单位信息
export const delUnit = (query) => {
    return request({
        url: '/erpv9/Subsidiary/delUnit',
        method: 'post',
        data: query
    })
};

//查询客户/供应商列表
export const clientOrContactList = (query) => {
    return request({
        url: '/erpv9/Subsidiary/clientOrContactList',
        method: 'post',
        data: query
    })
};

//增加客户/供应商信息
export const addClientOrContact = (query) => {
    return request({
        url: '/erpv9/Subsidiary/addClientOrContact',
        method: 'post',
        data: query
    })
};

//编辑客户/供应商信息
export const editClientOrContact = (query) => {
    return request({
        url: '/erpv9/Subsidiary/editClientOrContact',
        method: 'post',
        data: query
    })
};

//删除客户/供应商信息
export const delClientOrContact = (query) => {
    return request({
        url: '/erpv9/Subsidiary/delClientOrContact',
        method: 'post',
        data: query
    })
};

//增加销售驳回原因信息
export const addSOBackLog = (query) => {
    return request({
        url: '/erpv9/Subsidiary/addSOBackLog',
        method: 'post',
        data: query
    })
};

//增加领料驳回原因信息
export const addllBackLog = (query) => {
    return request({
        url: '/erpv9/Subsidiary/addllBackLog',
        method: 'post',
        data: query
    })
};

//查询领料驳回原因信息列表
export const seallBackLog = (query) => {
    return request({
        url: '/erpv9/Subsidiary/seallBackLog',
        method: 'post',
        data: query
    })
};


