import { getCategory, updateCategory, } from "../db/firestore.js";
import { saveImageFile, getPhotoURL } from "../db/storage.js";


const uploadImage = async(action) => {
    const imageUpload = document.querySelector("#file-input");
    const inputUrl = document.querySelector("#input-urlpost");
    const inputNameImage = document.querySelector("#input-nameImage");
    const arrayInfoImage = [];
    let image, nameImage, urlImage;
    if (imageUpload.files && imageUpload.files[0]) {
        image = true;
        nameImage = imageUpload.files[0].name;
        urlImage = await saveImageFile(nameImage, imageUpload.files[0], "images")
            .then(() => getPhotoURL(nameImage, "images"))
            .then((imageURL) => {
                return imageURL;
            });
    } else if (action == "create") {
        //entonces crea un post sin imagen
        image = false;
        nameImage = "";
        urlImage = "";
    } else {
        //entonces edita un post pero sin modificar imagen, o no tenia imagen
        image = (inputUrl.value == "") ? false : true;
        urlImage = inputUrl.value;
        nameImage = inputNameImage.value;
    }
    arrayInfoImage.push(image, nameImage, urlImage);
    return arrayInfoImage;
};

const updateTotalCategory = async(idCategory, action) => {
    //action es el string donde indica que va eliminar y editar
    const url = window.location.href;
    const path = url.split("#");
    if (action == "edit") {
        if (idCategory[0] != idCategory[1]) { //posicion 0 = valor del select , posicion 1 = valor de la categoria antes de ser editado
            for (let key in idCategory) {
                const category = await getCategory(idCategory[key]).then((res) => res.data()); //get data para tener el total post
                let totalCategory = category.totalPosts;
                totalCategory = (key == 0) ? parseInt(totalCategory) + 1 : parseInt(totalCategory) - 1;
                updateCategory(idCategory[key], { totalPosts: totalCategory }).then(() => {
                    if (path[1] == "/timeline") {
                        const spanCategory = document.querySelector("#category-" + idCategory[key]);
                        spanCategory.textContent = totalCategory + " Posts";
                    }
                });
            }
        }
    } else {
        const category = await getCategory(idCategory).then((res) => res.data()); //get data para tener el total post
        let totalCategory = category.totalPosts;
        totalCategory = (action == "create") ? parseInt(totalCategory) + 1 : parseInt(totalCategory) - 1;
        updateCategory(idCategory, { totalPosts: totalCategory }).then(() => {
            if (path[1] == "/timeline") {
                const spanCategory = document.querySelector("#category-" + idCategory);
                spanCategory.textContent = totalCategory + " Posts";
            }
        });
    }
};

export { uploadImage, updateTotalCategory }