function welcome(req, res) {
    return res.json({
        status: "success",
        message: "Welcome to nellicious API",
        information: {
            register_account: "api/register",
            login_account: "api/login",
            get_account: "api/account/{user_id}",
        },
    });
}

module.exports = { welcome };