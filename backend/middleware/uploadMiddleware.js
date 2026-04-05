const multer = require('multer');

const path = require('path');

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },

  filename: function (req, file, cb) {

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    const ext = path.extname(file.originalname);

    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép tải lên file ảnh (PNG, JPG, GIF, WebP, SVG)'), false);
  }
};

const upload = multer({
  storage,

  fileFilter,

  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
