module.exports = {
    name_reg:/^[a-z\u4e00-\u9fa5]{2,10}$/i, //帐号验证
    name_txt:'2至10个英文或中文字符', //帐号规则
    pass_reg:/^(?=.*[a-z])(?=.*\d)[a-z\d]{6,12}$/i, //密码验证
    pass_txt:'6至12个英文和数字组成的字符', //密码规则
    upFile_maxSize:1024*1024*5,//上传文件大小限制
    upFile_accept:/^image\//,//上传文件格式限制
}