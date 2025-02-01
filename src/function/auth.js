const { supabase } = require('../supabase');
const { v4: uuidv4 } = require('uuid');

async function registerAccount(req, res) {
    const user_id = uuidv4();
    const { username, image, email, role, password } = req.body;

    if (!user_id || !username || !image || !email || !role || !password) {
        return res.status(404).json({
            status: "failed",
            message: "Pastikan semua field telah terisi!"
        });
    }
    const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("email", email)
    if (data.length > 0) {
        return res.status(404).json({
            status: "failed",
            message: "Akun sudah terdaftar!"
        });
    }

    const { data: regData, error: regError } = await supabase
        .from("user")
        .insert([{ user_id, username, image, email, role, password, created_at: new Date().toLocaleString() }])
    if (regError) {
        return res.status(404).json({
            status: "failed",
            message: "Error register account!",
        });
    }
    return res.json({
        status: "success",
        message: "Success register account",
        user_id: user_id,
    });
}

async function loginAccount(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(404).json({
            status: "failed",
            message: "Pastikan semua field telah terisi!"
        });
    }
    const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("email", email)
        .eq("password", password)
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: "Error login account!",
        });
    }
    if (data.length === 0) {
        return res.status(404).json({
            status: "failed",
            message: "Pastikan email dan password sesuai!",
        });
    }
    return res.json({
        status: "success",
        message: `Welcome ${data[0].username}!`,
        user_id: data[0].user_id,
    });
}

module.exports = { registerAccount, loginAccount }