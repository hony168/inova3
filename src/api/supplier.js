import request from '../utils/request';

//查询供应商
export const select_Supplier = (query) => {
    return request({
        url: '/erp/Supplier/select_Supplier',
        method: 'post',
        data: query
    })
};

