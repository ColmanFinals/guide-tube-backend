// multerConfig.ts
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Specify the destination folder for your uploads
        cb(null, "public/images/");
    },
    filename: function (req, file, cb) {
        // Specify the filename for the uploaded file
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

const postFields = [
    {name: "picture", maxCount: 1},
    {name: "gameFile", maxCount: 1},
];

const uploadFile = multer({storage: storage}).single("file");

const uploadPostFiles = multer({storage: storage}).fields(postFields);

const deleteFile = async (filePath: string) => {
    try {
        fs.unlink(filePath, (deleteError) => {
            if (deleteError) {
                console.error("Error deleting old file:", deleteError);
            } else {
                console.log("Old file deleted successfully");
            }
        });
    } catch (deleteError) {
        console.error("Error deleting old file:", deleteError);

    }
};

export {uploadPostFiles, deleteFile, uploadFile};
