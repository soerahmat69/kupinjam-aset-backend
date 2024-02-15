module.exports={ApiResponse:(message,status, statusCode, data = null)=>{
    return {
        message: message,
        success:status,
        status: statusCode,
        data: data
    };
}
}