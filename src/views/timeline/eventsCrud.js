import { uploadImage, updateTotalCategory } from "../../lib/utils.js";
import { alerts, btnProcess } from "../../lib/alerts.js";
import { loadViewPost } from "./addInfoTimeLine.js";
import { savePost, datePost, deletePostFs, updatePost, getPost } from "../../db/firestore.js";



// ------------------------------ Evento al hacer Submit en el Modal --------------------------------------

const addEventFormPost = () => {
    const formPost = document.querySelector("#form-create-post");
    const inputTextarea = document.querySelector("#post-user");
    const selectCategory = document.querySelector("#select-categories");
    const selectPublic = document.querySelector("#select-public");
    const inputIdPost = document.querySelector("#input-idpost");
    const idUserAuth = localStorage.getItem('iduser');
    /** Evento en caso de Cambio de Imagen**/


    /** Evento para enviar Formulario**/
    formPost.addEventListener("submit", async(e) => {
        e.preventDefault();
        btnProcess(true);
        const objectPost = {
            contentPost: inputTextarea.value,
            datePost: datePost(),
            idCategory: selectCategory.value,
            publicPosts: selectPublic.value,
        };
        //Si el Input del IdPost es Vacio, entonces es crear
        if (inputIdPost.value == "") {
            //retorna un array con la info para la imagen
            const dataUploadImage = await uploadImage("create");
            objectPost.idUser = idUserAuth;
            objectPost.image = dataUploadImage[0];
            objectPost.nameImage = dataUploadImage[1];
            objectPost.urlImage = dataUploadImage[2];
            objectPost.arrComments = [];
            objectPost.arrLikes = [];
            createObjectPost(objectPost);
        } else {
            const dataUploadImage = await uploadImage("edit");
            objectPost.image = dataUploadImage[0];
            objectPost.nameImage = dataUploadImage[1];
            objectPost.urlImage = dataUploadImage[2];
            updateObjectPost(objectPost, inputIdPost.value);
        }
    });
};


// ------------------------------ Evento al hacer Click en ek btn de Eliminar (Tachito) --------------------------------------

const addEventDeletePost = () => {
    const btnsDelete = document.querySelectorAll(".btn-delete");
    const btnCerrarModal = document.querySelector(".btn-cerrar-modal-delete"); /* cerrar */
    const modalDelete = document.querySelector(".modal-delete");
    btnCerrarModal.addEventListener("click", () => {
        modalDelete.classList.remove("revelar");
    });

    btnsDelete.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            modalDelete.classList.add("revelar");
            const idPosts = e.target.dataset.id;
            deletePosts(idPosts, "#container-posts");
        });
    });

    function deletePosts(idPosts) {
        const confirmDelete = document.querySelector("#confirm-delete");
        const nodoPadre = document.querySelector("#container-posts");
        const nodoHijo = document.querySelector("#post-" + idPosts);

        confirmDelete.addEventListener("click", () => {
            deletePostFs(idPosts)
                .then(() => {
                    const inputCategory = document.querySelector("#input-category-" + idPosts);
                    nodoPadre.removeChild(nodoHijo);
                    modalDelete.classList.remove("revelar"); //oculta el modal
                    updateTotalCategory(inputCategory.value, "delete");
                    alerts("success", "Eliminado con exito");
                })
                .catch((err) => {
                    modalDelete.classList.remove("revelar"); //oculta el modal
                    alerts("error", "Hubo un error " + err);
                });
        });
    }
};

// ------------------------------ Evento al hacer Click en ek btn de Editar (Lapiz) --------------------------------------

const addEventEditPost = () => {
    const btnsEdit = document.querySelectorAll(".btn-edit");
    const modal = document.querySelector(".modal");
    const titleModal = document.querySelector("#title-modal");
    const btnModal = document.querySelector("#share-post");

    btnsEdit.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            btnModal.innerText = "Guardar Cambios";
            titleModal.innerText = "Editar Post";
            const idPost = e.target.dataset.id;
            loadDataPosts(idPost);
            modal.classList.add("revelar");
        });
    });

    async function loadDataPosts(idPost) {
        const inputTextarea = document.querySelector("#post-user");
        const sectionNameImgUpload = document.querySelector(".name-image-upload");
        const selectCategory = document.querySelector("#select-categories");
        const selectPublic = document.querySelector("#select-public");
        const inputIdPost = document.querySelector("#input-idpost");
        const inputUrl = document.querySelector("#input-urlpost");
        const inputNameImage = document.querySelector("#input-nameImage");
        const dataPost = await getPost(idPost).then((response) => response.data());
        (dataPost.publicPosts == "true") ? selectPublic.value = "true": selectPublic.value = "false";

        inputIdPost.value = idPost;
        selectCategory.value = dataPost.idCategory;
        inputTextarea.value = dataPost.contentPost;
        inputUrl.value = dataPost.urlImage;
        inputNameImage.value = dataPost.nameImage;
        sectionNameImgUpload.innerHTML = `<span> ${dataPost.nameImage} </span>`;
    }
};

// ------------------------------ Evento para guardar Post en Firestore y Renderizar en la DOM --------------------------------------

const createObjectPost = (object) => {
    const selectCategory = document.querySelector("#select-categories");
    const textSelect = selectCategory.options[selectCategory.selectedIndex].text;
    const infouser = JSON.parse(window.localStorage.getItem("infouser"));
    const modal = document.querySelector(".modal");
    savePost(object)
        .then((res) => {
            // Necesitamos el res para obtener el id generado en el firestore
            const newObjectPost = [{
                idPost: res.id,
                idUser: object.idUser,
                nameUser: infouser.nameuser,
                photoUser: infouser.photouser,
                contentPost: object.contentPost,
                datePost: object.datePost.toDate().toDateString(),
                nameImage: object.nameImage,
                arrComments: [],
                arrLikes: [],
                image: object.image,
                publicPosts: object.publicPosts,
                idCategory: object.idCategory,
                nameCategory: textSelect,
                urlImage: object.urlImage,
            }];

            loadViewPost(newObjectPost); //Rendereizamos el Post en la DOM, funcion esta en viewPost linea 37
            modal.classList.remove("revelar"); //Cierra el modal?
            btnProcess(false);
            updateTotalCategory(selectCategory.value, "create"); //editamos el total de Categorias
            alerts("success", "Post Publicado");
        })
        .catch((error) => {
            btnProcess(false);
            alerts("error", error);
        });
};

// ------------------------------ Evento para guardar Post en Firestore tras Editar y Renderizar en la DOM --------------------------------------
const updateObjectPost = (objectPost, idPost) => {
    const selectCategory = document.querySelector("#select-categories");
    const textSelect = selectCategory.options[selectCategory.selectedIndex].text;
    const spanDate = document.querySelector("#span-date-" + idPost);
    const spanCategory = document.querySelector("#span-category-" + idPost);
    const paragraphPost = document.querySelector("#paragraph-post-" + idPost);
    const imagePost = document.querySelector("#image-post-" + idPost);
    const spanPublic = document.querySelector("#publicPost-" + idPost);
    const inputCategory = document.querySelector("#input-category-" + idPost);
    const modal = document.querySelector(".modal");

    updatePost(idPost, objectPost)
        .then(() => {
            //Actualizamos la DOM con los datos que edito el usuario
            spanDate.innerText = objectPost.datePost.toDate().toDateString();
            spanCategory.innerText = textSelect;
            paragraphPost.innerText = objectPost.contentPost;
            //Evaluamos si ha agregado una imagen o ha cambiado
            if (objectPost.image) {
                imagePost.src = objectPost.urlImage;
                imagePost.classList.add("content-image");
            }
            if (objectPost.publicPosts == "true") {
                spanPublic.innerHTML = `<i class="fas fa-globe-americas"></i>`;
            } else {
                spanPublic.innerHTML = `<i class="fas fa-lock"></i>`;
            }

            modal.classList.remove("revelar"); //Cierra el modal
            btnProcess(false);
            updateTotalCategory([selectCategory.value, inputCategory.value], "edit"); //actualizamos nuestro contador en la colleccion categoria
            inputCategory.value = selectCategory.value; // Actualizamos el nuevo valor del inputCategory de viewpost linea 77
            alerts("success", "Post Editado");
        })
        .catch((error) => {
            btnProcess(false);
            alerts("error", error);
        });
};

export {
    addEventFormPost,
    addEventDeletePost,
    addEventEditPost,
    createObjectPost,
};