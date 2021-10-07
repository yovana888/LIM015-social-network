import { getUser } from '../../db/firestore.js';
import { loadViewModals } from '../modal/viewModals.js';
import { getObjectPosts, allCategories, getTopPopularPosts } from './getDataFirebase.js';
import { alerts } from '../../lib/alerts.js';
import { addEventDeletePost, addEventEditPost } from './eventsCrud.js'
import { createEmoji } from '../../lib/emoji.js';
import { addEventLinkUser, addEventLike, addEventComments } from './eventsTimeline.js'

// ------------------------------ Renderizar Header con la Info User------------------------------------------------

const loadViewHeaderUser = async() => {
    const iduser = localStorage.getItem('iduser'); //extraemos el iduser auth almacenado en local login linea 60
    const infouser = await getUser(iduser).then(response => response.data());
    const userInfoHtml = document.querySelector('#user-info'); //id del section dentro del header
    const photo = infouser.photouser;
    window.localStorage.setItem('infouser', JSON.stringify(infouser)); //guardamos toda la info del usuario Auth en local
    userInfoHtml.innerHTML = `<span class="user-information">  
                                    <span class="link-user" data-id="${iduser}" id="avatar-name-header"> Mi Perfil </span> 
                                    <img class="avatar avatar-sm" src="${photo}" id="avatar-photouser-header" alt="img-user"> 
                                </span>`
}


//--------------------------------- Obtener Data para Renderizar Todos los Posts o por Filtro -------------------------------------------------------------

const loadAllPosts = async(idCategory, idUser) => { //Extrae la data publica o privada 
    const objectDataPosts = await getObjectPosts(idCategory, idUser).then((response) => response);
    const idUserAuth = localStorage.getItem('iduser');
    const dataPublic = objectDataPosts.filter((element) => element.publicPosts == "true" || element.idUser == idUserAuth);
    const totalPostsPrivate = objectDataPosts.length - dataPublic.length; //total post privados 
    const containerPost = document.querySelector("#container-posts");
    containerPost.innerHTML = "";
    loadViewPost(dataPublic);

    if (totalPostsPrivate > 0 && idCategory != "all") {
        alerts('info', 'No se mostraran ' + totalPostsPrivate + ' por que son privados') //Alerta en las categorías 
    }
};

// --------------------------------- Renderizar Posts-------------------------------------------------------------

const loadViewPost = (dataPublic) => {
        const containerPost = document.querySelector("#container-posts");
        const idUserAuth = localStorage.getItem('iduser');

        if (dataPublic.length == 0 || dataPublic == undefined) {
            alerts('info', 'No hay posts para mostrar o Todos los Post son Privados')
            containerPost.innerHTML = `<p class="text-muted notResults"> No se encontraron posts para mostrar  <i class="fas fa-passport text-muted"></i> </p>`;
        } else {
            dataPublic.forEach((element) => {
                        const post = document.createElement("div");
                        post.classList.add("post");
                        post.id = `post-${element.idPost}`;
                        post.innerHTML = ` 
                            <div class="post-header header">
                                <div class="header-left">
                                    <span class="link-user" data-id="${element.idUser}">   
                                        <img src="${element.photoUser}" alt="" class="post-author-pic imguser-profile">
                                    </span>
                                    <div class="post-author author">
                                        <span class="author-name link-user nameuser-profile" data-id="${element.idUser}"> ${element.nameUser} </span>
                                    </div>
                                    <span id="span-date-${element.idPost}" class="post-date">${element.datePost}</span>
                                    <span class="span-public" id="publicPost-${element.idPost}">${element.publicPosts == "true"? `<i class="fas fa-globe-americas"></i>`: `<i class="fas fa-lock"></i>`} </span>
                                </div>

                                <div class="header-right">
                                    <div class="post-category">
                                        ${element.idUser == idUserAuth ? `<img class="btn btn-edit" width="22px" height="22px" data-id="${element.idPost}" src="../src/assets/images/svg/edit.png"><img class="btn btn-delete" data-id="${element.idPost}" src="../src/assets/images/svg/delete.png">`: ``}
                                        <span class="badge badge-secondary" id="span-category-${element.idPost}">${element.nameCategory}</span>
                                    </div>          
                                </div>
                            </div>

                            <div class="post-content"> <input type=hidden id="input-category-${element.idPost}" value="${element.idCategory}">
                                <p class="content-paragraph" id="paragraph-post-${element.idPost}"> ${element.contentPost} </p>
                                ${element.image == true? `<img id="image-post-${element.idPost}" src="${element.urlImage}" class="content-image" />`: `<img id="image-post-${element.idPost}"/>`}
                            </div>

                            <div class="post-footer footer">
                                <div class="footer-reactions reactions">
                                    <img class="img-like likes" id="like-${element.idPost}" width="22px" height="22px" data-id="${element.idPost}"  src=" ${element.arrLikes.includes(idUserAuth)? "../src/assets/images/svg/like.png": "../src/assets/images/svg/notlike.png"}"  data-id="${element.idPost}"/>
                                    <span class="count-reaction" id="count-like-${element.idPost}">${element.arrLikes.length}</span> 
                                    
                                    <img class="img-comment btn-comments" id="comment-${element.idPost}" width="22px" height="22px"   src="../src/assets/images/svg/notchat.svg"  data-id="${element.idPost}"/>
                                    <span class="count-reaction" id="count-comment-${element.idPost}">${element.arrComments.length}</span>             
                                </div>
                                <div class="footer-comments comments" id="footer-comments-${element.idPost}" style="display:none;">
                                </div>
                            </div>`;

                const theFirstChild = containerPost.firstChild;
                containerPost.insertBefore(post, theFirstChild); //renderiza en el hijo anterior del primero
        });
        addEventDeletePost();
        addEventEditPost();
        addEventLinkUser();
        addEventLike();
        addEventComments();
    } //Agregamos los Eventos principales para cada post
};


// ------------------------------ Renderizar Categorias-----------------------------

const loadViewCategory = async() => {
    const categories = document.querySelector('#categories');
    const allCategoriesCourse = await allCategories().then(response => response);
    allCategoriesCourse.forEach(element => {
        const figureCategory = document.createElement('figure');
        figureCategory.classList.add('category');
        figureCategory.innerHTML = `<img class="categoryIcon categoryName" src="../src/assets/images/svg/categorias/${ element.imagen }" alt="logo-categories" data-id=${element.idCategory} data-total=${element.totalPosts}>
                                    <div class="content-category">
                                        <span class="text-category categoryName" data-id=${element.idCategory} data-total=${element.totalPosts}> ${ element.nameCategory } </span>
                                        <p class="text-muted" id="category-${element.idCategory}">  ${ element.totalPosts } post</p>
                                    </div>`
        categories.appendChild(figureCategory);
    });
}


// ------------------------------ Renderizar Popular Posts-----------------------------

const loadViewPopularPost = async () => {
    const topPopularPosts = await getTopPopularPosts();
    const sliderPost = document.querySelector('.slider');

    topPopularPosts.forEach(element => {
        const cardPost = document.createElement('figure');
        cardPost.classList.add('card-post')
        cardPost.innerHTML = `
                    <div class="head-popularPosts">
                        <div class="imgUser">
                            <a href="#">
                            <img src="${element.photoUser}" alt="" class="post-author-pic">
                            </a>
                        </div>
                        <div class="name-hours">
                            <h5><span class="author-name link-user"> ${element.nameUser.substring(0, 10)}</span></h5>
                            <p <span class="post-date">${element.datePost}</span> </p>
                        </div>
                        <div class="heart-number">
                            <i class="fab fa-gratipay heart"></i>
                            <p> ${element.arrLikes.length > 0 ? element.arrLikes.length : 0} </p>
                        </div>
                    </div>
                    <div class="text-content">
                        <p class="p-posts"> ${element.contentPost.substring(0, 55)}... </p>
                    </div>
                    <div class="box-plus">
                        <img src="../src/assets/images/imgPopularPosts/plus.png" alt="" class="plus"  href="#seccion1">
                    </div>`
        sliderPost.appendChild(cardPost);
    })
    return sliderPost;
}

// ------------------------------ Renderizar Text Area Modal-----------------------------
const loadTextareaPosts = async() => {//Renderizar información del usuario(nombre, imagen)
    const userPost = document.querySelector('.user-info-textarea');
    const placeholderTextarea = document.querySelector('.textarea-post');
    const idUserAuth = localStorage.getItem('iduser'); //Esto vien de la linea 58 del archivo eventLogin OBTENER EL ID USER
    const infouser = await getUser(idUserAuth).then(response => response.data());
    userPost.innerHTML = ` <a href="#/profile" class="user-information">  
                                <img class="avatar avatar-sm imguser-profile" src="${infouser.photouser}" alt="img-user"> 
                                <span class="nameuser-profile"> ${infouser.nameuser} </span> 
                           </a>`
    placeholderTextarea.placeholder = `¿Qué quieres compartir hoy, ${infouser.nameuser}... ?`;
}


// ------------------------------ Cargamos los Componentes Necesarios para mostrar el TimeLine------------------

const loadComponetsTimeLine = async () => {
    loadViewModals();
    loadTextareaPosts();
    createEmoji();
    await loadViewHeaderUser();
    await loadAllPosts("all", "all");
    await loadViewCategory();
    await loadViewPopularPost();
}


export { loadComponetsTimeLine,  loadViewPost, loadAllPosts,loadTextareaPosts,loadViewHeaderUser };