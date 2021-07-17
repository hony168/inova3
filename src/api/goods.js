import request from '../utils/request';


//查询商品
export const selectGoods = (query) => {
    return request({
        url: '/erpv9/Goods/selectGoods',
        method: 'post',
        data: query
    })
};

//查询所有商品信息
export const selectAllGoods = (query) => {
    return request({
        url: '/erpv9/Goods/selectAllGoods',
        method: 'post',
        data: query
    })
};

//需要采购商品
export const seleCGiGoods = (query) => {
    return request({
        url: '/erpv9/Goods/seleCGiGoods',
        method: 'post',
        data: query
    })
};

//采购商品增加
export const addCGGoods = (query) => {
    return request({
        url: '/erpv9/Goods/addCGGoods',
        method: 'post',
        data: query
    })
};


//查询商品分类
export const generateTree = (query) => {
    return request({
        url: '/erpv9/Goods/generateTree',
        method: 'post',
        data: query
    })
};

//查询BOM模板列表
export const seaBom = (query) => {
    return request({
        url: '/erpv9/Goods/seaBom',
        method: 'post',
        data: query
    })
};

//批量导入商品库存及仓储位置
export const bacthImport = (query) => {
    return request({
        url: '/erpv9/Goods/bacthImport',
        method: 'post',
        data: query
    })
};

//删除物料图片信息
export const delImg = (query) => {
    return request({
        url: '/erpv9/Goods/delImg',
        method: 'post',
        data: query
    })
};
//查询BOM某一模板所有数据
export const seaBomModelData = (query) => {
    return request({
        url: '/erpv9/Goods/seaBomModelData',
        method: 'post',
        data: query
    })
};

//查询BOM分类
export const bomTree = (query) => {
    return request({
        url: '/erpv9/Goods/bomTree',
        method: 'post',
        data: query
    })
};

//查询单位分类
export const unitTree = (query) => {
    return request({
        url: '/erpv9/Goods/unitTree',
        method: 'post',
        data: query
    })
};

//查询仓库分类
export const locationTree = (query) => {
    return request({
        url: '/erpv9/Goods/locationTree',
        method: 'post',
        data: query
    })
};

//增加物料
export const addPart = (query) => {
    return request({
        url: '/erpv9/Goods/addPart',
        method: 'post',
        data: query
    })
};

//物料修改
export const eidtPart = (query) => {
    return request({
        url: '/erpv9/Goods/eidtPart',
        method: 'post',
        data: query
    })
};

//物料修改
export const delPart = (query) => {
    return request({
        url: '/erpv9/Goods/delPart',
        method: 'post',
        data: query
    })
};

//增加BOM模板
export const addBOMs = (query) => {
    return request({
        url: '/erpv9/Goods/addBOMs',
        method: 'post',
        data: query
    })
};

// 增加/修改BOM清单
export const addBOMGoods = (query) => {
    return request({
        url: '/erpv9/Goods/addBOMGoods',
        method: 'post',
        data: query
    })
};
// 增加/修改生产订单
export const addPDGoods = (query) => {
    return request({
        url: '/erpv9/Goods/addPDGoods',
        method: 'post',
        data: query
    })
};

//查询BOM某一模板所有数据(不分页)
export const seaBomAllOneData = (query) => {
    return request({
        url: '/erpv9/goods/seaBomAllOneData',
        method: 'post',
        data: query
    })
};

//修改采购订单中物料快递信息
export const editCGOrderexpressInfo = (query) => {
    return request({
        url: '/erpv9/Goods/editCGOrderexpressInfo',
        method: 'post',
        data: query
    })
};

//增加入库订单及订单商品
export const addRKOrderAndRKGoods = (query) => {
    return request({
        url: '/erpv9/Goods/addRKOrderAndRKGoods',
        method: 'post',
        data: query
    })
};

//增加领料订单及订单商品
export const addLLOrderAndLLGoods = (query) => {
    return request({
        url: '/erpv9/Goods/addLLOrderAndLLGoods',
        method: 'post',
        data: query
    })
};

//查询出库商品信息
export const seaCKGoods = (query) => {
    return request({
        url: '/erpv9/Goods/seaCKGoods',
        method: 'post',
        data: query
    })
};

//生产订单商品往返记录
export const turnoverLog = (query) => {
    return request({
        url: '/erpv9/Goods/turnoverLog',
        method: 'post',
        data: query
    })
};


//查询确认订单物料信息
export const selectConOrderGgoods = (query) => {
    return request({
        url: '/erp/Goods/selectConOrderGgoods',
        method: 'post',
        data: query
    })
};

//查询物料进价
export const seaGoodsInventoryDetail = (query) => {
    return request({
        url: '/erpv9/Goods/seaGoodsInventoryDetail',
        method: 'post',
        data: query
    })
};

//查询生产订单领料记录
export const getMaterialLog = (query) => {
    return request({
        url: '/erpv9/Goods/getMaterialLog',
        method: 'post',
        data: query
    })
};

//查询某一出库订单商品记录
export const QCKOrderList = (query) => {
    return request({
        url: '/erpv9/Goods/QCKOrderList',
        method: 'post',
        data: query
    })
};

//查询某一商品所有库存
export const QgoodsInventoryList = (query) => {
    return request({
        url: '/erpv9/Goods/QgoodsInventoryList',
        method: 'post',
        data: query
    })
};

//查询入库订单商品信息
export const seaRKBillGodds = (query) => {
    return request({
        url: '/erpv9/Goods/seaRKBillGodds',
        method: 'post',
        data: query
    })
};

//查询领料订单商品信息
export const seallBillGodds = (query) => {
    return request({
        url: '/erpv9/Goods/seallBillGodds',
        method: 'post',
        data: query
    })
};

//增加出库商品信息
export const addckgoods = (query) => {
    return request({
        url: '/erpv9/Goods/addckgoods',
        method: 'post',
        data: query
    })
};

//生成订单商品领料中记录
export const getPDBilleARingNumGodds = (query) => {
    return request({
        url: '/erpv9/Goods/getPDBilleARingNumGodds',
        method: 'post',
        data: query
    })
};

//查询出库某一商品
export const seaCKBilleGodds = (query) => {
    return request({
        url: '/erpv9/Goods/seaCKBilleGodds',
        method: 'post',
        data: query
    })
};

//商品备料
export const comGoodsCK = (query) => {
    return request({
        url: '/erpv9/Goods/comGoodsCK',
        method: 'post',
        data: query
    })
};

//商品备料完成
export const finishGoodsCK = (query) => {
    return request({
        url: '/erpv9/Goods/finishGoodsCK',
        method: 'post',
        data: query
    })
};

//修改出库订单状态
export const aa = (query) => {
    return request({
        url: '/erpv9/Goods/aa',
        method: 'post',
        data: query
    })
};

//修改销售订单中物料快递信息
export const editXSOrderexpressInfo = (query) => {
    return request({
        url: '/erpv9/Goods/editXSOrderexpressInfo',
        method: 'post',
        data: query
    })
};