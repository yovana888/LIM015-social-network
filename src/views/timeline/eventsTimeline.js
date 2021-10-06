import { sliderPopularPost } from '../../lib/animation.js';
import { updatePost, getPost } from "../../db/firestore.js";
import { loadAllPosts } from './addInfoTimeLine.js';
import { allUsers } from './getDataFirebase.js';
import { alerts } from '../../lib/alerts.js';
import { addEventFormPost, addEventDeletePost, addEventEditPost } from './eventsCrud.js'

// ------------------------------ Evento Click para redireccionar al perfil de un usuario-----------

const addEventLinkUser = () => {
    const allLinksUser = document.querySelectorAll('.link-user');
    allLinksUser.forEach(link => {
        link.addEventListener('click', (e) => {
            const idUser = e.target.dataset.id;
            localStorage.setItem('idUserRedirecionar', idUser); //almacenar el id del usuario a redireccionar
            window.location.href = `#/profile/${idUser}`;
        })
    })
}

// ------------------------------ Evento para abrir y cerrar Modal-----------------------------------

const addEventModalCreatePost = () => {
    const modal = document.querySelector('.modal');
    const btnCreatePost = document.querySelector('.btn-create-post'); /* abrir */
    const btnCerrarModal = document.querySelector('.btn-cerrar-modal'); /* cerrar */
    const sectionNameImgUpload = document.querySelector('.name-image-upload');
    btnCreatePost.addEventListener('click', () => {
        const btnModal = document.querySelector('#share-post'); /* abrir */
        const titleModal = document.querySelector('#title-modal');
        const formPost = document.querySelector('#form-create-post');
        formPost.reset();
        document.querySelector('#input-idpost').value = "";
        document.querySelector('#input-urlpost').value = "";
        btnModal.innerText = 'Publicar';
        titleModal.innerText = 'Crear Publicación';
        sectionNameImgUpload.innerHTML = ``;
        modal.classList.add('revelar');
    });

    btnCerrarModal.addEventListener('click', () => { //Cerrar modal en la X
        modal.classList.remove('revelar')
        document.querySelector('#form-create-post').reset(); //Limpia el formulario
    });
}

// ------------------------------ Evento para dar Like -----------------------------------

const addEventLike = () => {
    const allLikes = document.querySelectorAll(".likes");

    allLikes.forEach((btn) => {
        btn.addEventListener("click", async(e) => {
            const idPost = e.target.dataset.id;
            const dataPost = await getPost(idPost).then((response) => response.data());
            const idUserAuth = localStorage.getItem("iduser");
            const imgLike = document.querySelector("#like-" + idPost);
            const countLike = document.querySelector("#count-like-" + idPost);
            let newArrayLike;
            if (dataPost.arrLikes.includes(idUserAuth)) {
                newArrayLike = dataPost.arrLikes.filter((item) => item !== idUserAuth);
                imgLike.src = "../src/assets/images/svg/notlike.png";
            } else {
                newArrayLike = [...dataPost.arrLikes, idUserAuth];
                imgLike.src = "../src/assets/images/svg/like.png";
            }
            updatePost(idPost, { arrLikes: newArrayLike });
            countLike.innerText = newArrayLike.length; //actualiza el contador en la DOM
        });
    });
};

// ------------------------------ Evento para Filtrar por Categorias --------------------------------------

const addEventShowCategories = () => {
    //Entonces volvemos a Cargar Todos los Posts - 'Ver Todos'
    const spanAllCategories = document.querySelector('#span-all-categories');
    spanAllCategories.addEventListener('click', () => {
        loadAllPosts("all", "all"); //Archivo addInfoTimeLine Linea 24
    });

    //Entonces Cargamos los Post de acuerdo a la Categoria que se hizo Click o la Imagen
    const allCategoriesName = document.querySelectorAll('.categoryName');
    allCategoriesName.forEach(span => {
        span.addEventListener('click', async(e) => {
            const idSpanCategory = e.target.dataset.id;
            loadAllPosts(idSpanCategory, "all");
        })
    });
}

// ------------------------------ Evento para  Mostrar Comentarios --------------------------------------

const addEventComments = async() => {
    const allBtnComments = document.querySelectorAll(".btn-comments");
    allBtnComments.forEach((btn) => {
        let flag = false;
        btn.addEventListener("click", async(e) => {
            const idPost = e.target.dataset.id;
            const infoUserAuth = JSON.parse(window.localStorage.getItem('infouser')); //linea 13 viewsComponenstTimeline
            const footerComments = document.querySelector("#footer-comments-" + idPost); //elemento padre comentarios
            const allUsersPost = await allUsers().then((response) => response); //import de getDataFirebase linea 12 

            footerComments.style.display = "block"; //mostramos la seccion del footer Post

            if (flag == false) {
                const dataPost = await getPost(idPost).then((response) => response.data());
                const arrayComments = dataPost.arrComments;

                if (arrayComments.length > 0) {
                    arrayComments.forEach((element) => {
                        let arrayCommentsUser = element.split("--");
                        const userFriend = allUsersPost.find((element) => element.idUser == arrayCommentsUser[0]);
                        const boxCommentFriends = renderComments(userFriend.photoUser, userFriend.nameUser, arrayCommentsUser[1]); //Linea 143
                        footerComments.appendChild(boxCommentFriends);
                    });
                }

                addEventPostComment(idPost, arrayComments, infoUserAuth); //Linea 146, Evento Button Pubicar Comentario
                flag = true;
            } else {
                footerComments.style.display = "none";
                footerComments.innerHTML = "";
                flag = false;
            }
        });
    });
};

// ------------------------------ Renderizar Comentario---------------------------------------------------------

const renderComments = (photoUser, nameUser, commentUser) => {
    const boxCommentFriends = document.createElement("div");
    boxCommentFriends.classList.add("comments-friend-comment", "friend-comment");
    boxCommentFriends.innerHTML = `
                        <img src="${photoUser}" class="friend-comment-pic">
                        <div class="friend-comment-comment comment">
                            <p class="comment-author"> ${nameUser} </p>
                            <span class="comment-content"> ${commentUser} </span>
                        </div>
                        `;
    return boxCommentFriends;
}

// ------------------------------ Evento para Publicar un Nuevo Comentario--------------------------------------

const addEventPostComment = (idPost, arrayComments, infoUserAuth) => {
    const btnComment = document.querySelector("#btn-comment-" + idPost);
    const inputComment = document.querySelector("#input-comment-" + idPost);
    const spanTotalComments = document.querySelector('#count-comment-' + idPost);
    const idUserAuth = localStorage.getItem('iduser');

    btnComment.addEventListener("click", () => {
        if (inputComment.value != "") {
            const newCommentUser = idUserAuth + "--" + inputComment.value;
            arrayComments.push(newCommentUser);
            updatePost(idPost, { arrComments: arrayComments })
                .then(() => {
                    const footerComments = document.querySelector("#footer-comments-" + idPost);
                    const boxCommentFriends = renderComments(infoUserAuth.photouser, infoUserAuth.nameuser, inputComment.value);
                    footerComments.appendChild(boxCommentFriends);
                    inputComment.value = "";
                    spanTotalComments.textContent = arrayComments.length;
                    alerts("success", "Se agrego tu comentario");
                })
                .catch((error) => {
                    alerts("error", error);
                });
        } else {
            alerts("error", "Debes escribir algo");
        }
    });
}

// ------------------------------ Evento para Cambiar Nombre de Input File en Modal--------------------------------------

const changeNameFileImage = () => {
    const imageUpload = document.querySelector("#file-input");
    const sectionNameImgUpload = document.querySelector(".name-image-upload");
    imageUpload.addEventListener("change", () => {
        if (imageUpload.files && imageUpload.files[0]) {
            sectionNameImgUpload.innerHTML = `<span> ${imageUpload.files[0].name} </span>`;
        }
    });
}


// ------------------------------ Cargamos los Eventos Necesarios para la DOM TimeLine------------------
const url = window.location.href;
const path = url.split('#');

const loadEventsDomTimeLine = () => {
    document.querySelector('#div-body').className = "bodyBackground";
    addEventModalCreatePost();
    addEventLinkUser();
    addEventLike();
    addEventComments();
    addEventFormPost();
    addEventDeletePost();
    addEventEditPost();
    changeNameFileImage();
    if (path[1] == '/timeline') {
        sliderPopularPost(); //Para Popular Post
        addEventShowCategories();
    }
}

export {
    loadEventsDomTimeLine,
    addEventLinkUser,
    addEventLike,
    addEventComments
}