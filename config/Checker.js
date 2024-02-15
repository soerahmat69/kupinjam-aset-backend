const Ngeregex = (param)=>{
    if (!/^[a-zA-Z0-9\s]+$/.test(param)) {
        return true
      }
}
const { ApiResponse } = require("./ApiResponse");

module.exports = {
  CheckValidationAuth: async (req, res,next) => {
    let username = req.body.username;
    let password = req.body.password;
    if (username === "" || password === "") {
     
      return res
      .status(400)
      .send(ApiResponse("Username dan password tidak boleh kosong.", true, 400, []));
  }
    

    if (Ngeregex(username) || Ngeregex(password)) {
   
      return res
      .status(400)
      .send(ApiResponse("Username dan password hanya boleh mengandung huruf dan angka.", true, 400, []));
    }
    next()
  },
  CheckValidationFormUser: async (req, res, next) => {
    const username = req.body.username;
    const no_wa = parseInt(req.body.no_wa);
    const password = req.body.password;
    const _role = req.body._role;

    if (!no_wa) {
 
      return res
      .status(400)
      .send(ApiResponse("whatsapp harus menggunakan angka", true, 400, []));
    }
    if (!username || !password || !no_wa || !_role) {
      return res
      .status(400)
      .send(ApiResponse("form input tidak boleh kosong.", true, 400, []));
    }
    if (Ngeregex(username) || Ngeregex(password) || Ngeregex(no_wa) || Ngeregex(_role)   ) {
 
      return res
      .status(400)
      .send(ApiResponse("Username dan password hanya boleh mengandung huruf dan angka.", true, 400, []));
    }
    next();
  },
};
