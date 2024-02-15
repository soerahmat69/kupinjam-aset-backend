const {  CheckValidationFormUser } = require('../config/Checker');
const { CreateDataUser, DeleteDataUser, DataUser, EditDataUser, DataUserPeminjam, DataUserPengemudi } = require('../controllers/Admin/KelolaUser');
const { DataRequest, CreateDataRequest, EditDataRequest, DeleteDataRequest, DataRequestTotalitas, DataRequestSelesai, DataRequestTolak, DataRequestBatal } = require('../controllers/Admin/KelolaPermintaan');
const { ValidRoleAdmin, ValidUserSess, ValidRolePeminjam, ValidRoleDriver } = require('../controllers/Auth');
const { DataSesiPenggunaan, CreateDataSesiPenggunaan, EditDataSesiPenggunaan, DeleteDataSesiPenggunaan, DataSesiPenggunaanSelesai } = require('../controllers/Admin/KelolaSesiPenggunaan');
const { DataAssetKendaraan,CreateDataAssetKendaraan, EditDataAssetKendaraan, DeleteDataAssetKendaraan, DataAssetSiap, DataAssetDetail, DataAssetDetailEtc } = require('../controllers/Admin/KelolaAssetKendaraan');
const {HandleUploadAsset} = require('../config/UploadImage');
const { DataDashboard, CreateDataVisualPie, DeleteDataVisualPie, DataVisualPie } = require('../controllers/Admin/Dashboard');
const { DataProfile } = require('../controllers/Admin/KelolaProfil');
const { DataJabatan } = require('../controllers/Admin/KelolaJabatan');
const { PinjamAsetApi, PeminjamDataRequest, PeminjamDataRequestSelesai, PeminjamDeleteDataRequest, PeminjamEditDataRequest, PeminjamCancelDataRequest } = require('../controllers/Peminjam/UserRequest');
const {DriverDataDashboard} = require('../controllers/Driver/DriverDashboard');
const { DriverDataKeberangkatan, DriverPilihPerjalanan, EditDataKeberangkatan, DriverTolakPerjalanan } = require('../controllers/Driver/DriverKeberangkatan');
const { PeminjamanDataDashboard } = require('../controllers/Peminjam/PeminjamDashboard');
const router = require('express').Router();



router.get("/admin/dashboard/:_YYYY/:_MM",ValidRoleAdmin,ValidUserSess, DataDashboard )
router.get("/admin/user",ValidRoleAdmin,ValidUserSess,DataUser )
router.get("/admin/user/peminjam",ValidRoleAdmin,ValidUserSess,DataUserPeminjam )
router.get("/admin/user/pengemudi",ValidRoleAdmin,ValidUserSess,DataUserPengemudi )
router.get("/admin/visualpie",ValidRoleAdmin,ValidUserSess,DataVisualPie )
router.get("/admin/profile",ValidRoleAdmin,ValidUserSess,DataProfile )
router.get("/profile",ValidUserSess,DataProfile )
router.get("/admin/request",ValidRoleAdmin,ValidUserSess,DataRequest )
router.get("/admin/request/etc",ValidRoleAdmin,ValidUserSess,DataRequestTotalitas )
router.get("/admin/request/status/selesai",ValidRoleAdmin,ValidUserSess,DataRequestSelesai )
router.get("/admin/request/status/drivertolak",ValidRoleAdmin,ValidUserSess,DataRequestTolak )
router.get("/admin/request/status/batal",ValidRoleAdmin,ValidUserSess,DataRequestBatal)
router.get("/admin/asset",ValidRoleAdmin,ValidUserSess,DataAssetKendaraan )
router.get("/admin/asset/siap",ValidRoleAdmin,ValidUserSess,DataAssetSiap )
router.get("/admin/asset/etc/:_id",ValidRoleAdmin,ValidUserSess,DataAssetDetailEtc )
router.get("/admin/asset/detail/:_id",ValidRoleAdmin,ValidUserSess,DataAssetDetail )
router.get("/admin/sesiguna",ValidRoleAdmin,ValidUserSess,DataSesiPenggunaan )
router.get("/admin/sesiguna/status/selesai",ValidRoleAdmin,ValidUserSess,DataSesiPenggunaanSelesai )
router.get("/admin/jabatan",ValidRoleAdmin,ValidUserSess,DataJabatan )

router.get("/peminjam/request",ValidRolePeminjam,ValidUserSess,PeminjamDataRequest )
router.get("/peminjam/dashboard",ValidRolePeminjam,ValidUserSess,PeminjamanDataDashboard )
router.get("/peminjam/request/selesai",ValidRolePeminjam,ValidUserSess,PeminjamDataRequestSelesai )
router.get("/driver/dashboard/:_YYYY/:_MM",ValidRoleDriver,ValidUserSess,DriverDataDashboard)
router.get("/driver/keberangkatan",ValidRoleDriver,ValidUserSess,DriverDataKeberangkatan)
router.get("/driver/aset/siap",ValidRoleDriver,ValidUserSess,DataAssetSiap)

router.post("/admin/user/add",ValidRoleAdmin,ValidUserSess,CheckValidationFormUser,CreateDataUser )
router.post("/peminjam/pinjam/add",ValidRolePeminjam,ValidUserSess,PinjamAsetApi )
router.post("/admin/visualpie/add",ValidRoleAdmin,ValidUserSess,CreateDataVisualPie)
router.post("/admin/request/add",ValidRoleAdmin,ValidUserSess,CreateDataRequest )
router.post("/admin/asset/add",ValidRoleAdmin,ValidUserSess,HandleUploadAsset,CreateDataAssetKendaraan )
router.post("/admin/sesiguna/add",ValidRoleAdmin,ValidUserSess,CreateDataSesiPenggunaan )

router.put("/peminjam/request/edit/:_id",ValidRolePeminjam,ValidUserSess, PeminjamEditDataRequest )
router.put("/peminjam/request/cancel/:_id",ValidRolePeminjam,ValidUserSess, PeminjamCancelDataRequest )
router.put("/driver/perjalanan/:_id",ValidRoleDriver,ValidUserSess,DriverPilihPerjalanan)
router.put("/driver/perjalanan/tolak/:_id",ValidRoleDriver,ValidUserSess,DriverTolakPerjalanan)
router.put("/driver/sesiguna/edit/:_id",ValidRoleDriver,ValidUserSess, EditDataKeberangkatan )

router.put("/admin/user/edit/:_id",ValidRoleAdmin,ValidUserSess,CheckValidationFormUser, EditDataUser )
router.put("/admin/request/edit/:_id",ValidRoleAdmin,ValidUserSess, EditDataRequest )
router.put("/admin/asset/edit/:_id",ValidRoleAdmin,ValidUserSess, HandleUploadAsset,EditDataAssetKendaraan )
router.put("/admin/sesiguna/edit/:_id",ValidRoleAdmin,ValidUserSess, EditDataSesiPenggunaan )

router.delete("/admin/user/delete/:_id",ValidUserSess,ValidRoleAdmin,DeleteDataUser )
router.delete("/admin/request/delete/:_id",ValidRoleAdmin,ValidUserSess,DeleteDataRequest )
router.delete("/peminjam/request/delete/:_id",ValidRolePeminjam,ValidUserSess,PeminjamDeleteDataRequest )
router.delete("/admin/asset/delete/:_id",ValidRoleAdmin,ValidUserSess,DeleteDataAssetKendaraan )
router.delete("/admin/sesiguna/delete/:_id",ValidRoleAdmin,ValidUserSess,DeleteDataSesiPenggunaan )
router.delete("/admin/visualpie/delete/:_id",ValidRoleAdmin,ValidUserSess,DeleteDataVisualPie )
router.delete("/admin/visualpie/delete/:_id",ValidRoleAdmin,ValidUserSess,DeleteDataVisualPie)

module.exports = router