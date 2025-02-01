const { supabase } = require("../supabase");

async function getAccount(req, res) {
    const { user_id } = req.params;
    if (!user_id) {
        return res.status(404).json({
            status: "failed",
            message: "User id kosong!"
        });
    }
    const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("user_id", user_id)
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: "Error get account!"
        });
    }
    if (data.length === 0) {
        return res.status(404).json({
            status: "failed",
            message: `akun dengan id:${user_id} tidak ditemukan`
        })
    }
    return res.json({
        status: "success",
        data: data
    });
}

async function editAccount(req, res) {
    const { user_id } = req.params;
    const { username, email, password } = req.body;
    if (!user_id) {
        return res.status(404).json({
            status: "failed",
            message: "user id kosong!"
        });
    }
    const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("user_id", user_id);
    if (data.length === 0) {
        return res.status(404).json({
            status: "failed",
            message: `Akun dengan id:${user_id} tidak ditemukan, gagal mengupdate!`
        });
    }
    else {
        const { data, error } = await supabase
            .from("user")
            .update({ username, email, password })
            .eq("user_id", user_id);
        if (error) {
            return res.status(404).json({
                status: "failed",
                message: error.message
            })
        }
        return res.json({
            status: "success",
            message: `Akun dengan id:${user_id} berhasil diubah!`
        });
    }
}

async function deleteAccount(req, res) {
    const { user_id } = req.params;
    if (!user_id) {
        return res.status(404).json({
            status: "failed",
            message: "user id kosong!"
        });
    }
    const { data, error } = await supabase
        .from("user")
        .delete()
        .eq("user_id", user_id)
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message
        });
    }
    return res.json({
        status: "success",
        message: `Akun dengan id:${user_id} berhasil dihapus!`
    });
}

module.exports = { getAccount, editAccount, deleteAccount }