import { updateProfileUser, getTopTenUsers, getUser } from "../../db/firestore.js";
import { loadAllPosts, loadTextareaPosts, loadViewHeaderUser } from "../timeline/addInfoTimeLine.js";
import { saveImageFile, getPhotoURL } from "../../db/storage.js";
import { alertProcess, alerts } from "../../lib/alerts.js";
import { createEmoji } from '../../lib/emoji.js';
import { loadViewModals } from '../modal/viewModals.js';
import { addEventLinkUser } from '../timeline/eventsTimeline.js'

// ------------------------ Carga la Info del Usuario (portada, profile) ---------------------------
const loadInfoUser = async() => {
    const idUserRedirect = window.localStorage.getItem('idUserRedirecionar'); //IdUser click en su nombre
    const infoUserProfile = await getUser(idUserRedirect).then(response => response.data());
    const avatarUser = document.querySelector("#avatar-user");
    const avatarName = document.querySelector("#avatar-name");
    const coverUser = document.querySelector("#img-cover-user")
    const avatarDescription = document.querySelector("#avatar-description");
    avatarUser.src = infoUserProfile.photouser;
    avatarName.textContent = infoUserProfile.nameuser;
    avatarDescription.textContent = infoUserProfile.description;
    coverUser.src = infoUserProfile.photocover;
};

// ------------------------ Carga todos los Post del usuario (Luego de Hacer Click en un nombre) ---------------------------

const loadPostUser = async() => {
    const idUserRedirect = localStorage.getItem('idUserRedirecionar'); //esto viene de eventsTimeline linea 28
    await loadAllPosts("all", idUserRedirect); //esto esta en addInfoTimeline.js Linea 24; es all porque no filtra por categorias
};

// ----------------------- Evento para Mostrar o Ocultar Button de Editar Perfil, al ver un Perfil de Usuario ---------------------------

const showButtonsProfile = () => {
    const url = window.location.href;
    const path = url.split('#');
    const idUserRedirect = localStorage.getItem('idUserRedirecionar');
    if (path[1] == `/profile/${idUserRedirect}`) {
        const idUserAuth = localStorage.getItem('iduser'); //Esto vien de la linea 58 del archivo eventLogin OBTENER EL ID USER
        const btnCrear = document.querySelector("#btn-crear")
        const btnEditarPerfil = document.querySelector("#btn-editarPerfil")
        document.querySelector('#div-body').className = "bodyBackground"; //cambiar color del Body

        if (idUserAuth === idUserRedirect) {
            btnCrear.style.display = "block";
            btnEditarPerfil.style.display = "block";
        } else {
            btnCrear.style.display = "none";
            btnEditarPerfil.style.display = "none";
        }
    }
}

// ----------------------- Evento para Abrir y Cerrar Modal de Editar Profile ---------------------------

const showModalEditProfile = () => {
    const modal = document.querySelector('.modal-edit-profile');
    const btnEditProfile = document.querySelector('#btn-editarPerfil');
    const btnCloseModal = document.querySelector('.modal-edit-profile .btn-cerrar-modal');

    btnEditProfile.addEventListener('click', () => { //Evento que Abre modal
        modal.classList.add('revelar')
        addEventsModalEdit()
    })

    btnCloseModal.addEventListener('click', () => { //evento para cerrar el modal
        modal.classList.remove('revelar')
        document.querySelector('#form-edit-profile').reset();
    });
}

// ----------------------- Evento para Cargar Data en Modal Profile ---------------------------

const addEventsModalEdit = async() => {
    const idUserAuth = localStorage.getItem('iduser');
    const infouser = await getUser(idUserAuth).then(response => response.data());
    const previewImgUser = document.querySelector('#preview-edit-photoUser')
    const previewImgCover = document.querySelector('#preview-edit-photoCover')
    const titleModal = document.querySelector('.modal-edit-profile #title-modal');
    const inputImgUser = document.querySelector('#input-file-photoUser');
    const inputImgCover = document.querySelector('#input-file-photoCover');
    const inputNameUser = document.querySelector('#name-edit');
    const inputEmailUser = document.querySelector('#email-edit');
    const inputDescriptionUser = document.querySelector('#textarea-description');
    const formEditProfile = document.querySelector('#form-edit-profile');

    let changePhotoUser = false;
    let changePhotoCover = false;
    titleModal.innerText = 'Editar Perfil';
    previewImgUser.src = infouser.photouser;
    previewImgCover.src = infouser.photocover;
    inputNameUser.value = infouser.nameuser;
    inputEmailUser.value = infouser.email;
    inputDescriptionUser.value = infouser.description;
    let filenameUser, filenameCover, filearrayUser, filearrayCover;

    inputImgUser.addEventListener('change', async(e) => { //Evento a los input file imagen de usuario
        changePhotoUser = true;
        filenameUser = e.target.files[0].name;
        filearrayUser = e.target.files[0];
        previewImageEdit(filearrayUser, previewImgUser, infouser);
    })

    inputImgCover.addEventListener('change', (e) => { //Evento a los input file portada de usuario
        changePhotoCover = true;
        filenameCover = e.target.files[0].name;
        filearrayCover = e.target.files[0];
        previewImageEdit(filearrayCover, previewImgCover, infouser);
    })

    formEditProfile.addEventListener('submit', async e => { //Evento para leer los nuevos datos del formulario
        e.preventDefault();
        alertProcess(true);
        const objectUpdatedUser = {
            nameuser: inputNameUser.value,
            description: inputDescriptionUser.value,
        };

        if (changePhotoUser === true) {
            const urlPhotoUser = await valueImage(filearrayUser, filenameUser, 'user')
            const avatarUser = document.querySelector("#avatar-user");
            avatarUser.src = urlPhotoUser;
            objectUpdatedUser.photouser = urlPhotoUser;
        }

        if (changePhotoCover === true) {
            const urlPhotoCover = await valueImage(filearrayCover, filenameCover, 'cover');
            const coverUser = document.querySelector("#img-cover-user")
            coverUser.src = urlPhotoCover;
            objectUpdatedUser.photocover = urlPhotoCover;

        }

        updateProfileUser(idUserAuth, objectUpdatedUser).then(async() => {
            alertProcess(false)
            const avatarName = document.querySelector("#avatar-name");
            const avatarDescription = document.querySelector("#avatar-description");
            const modal = document.querySelector('.modal-edit-profile');
            const allImgUserPost = document.querySelectorAll('.imguser-profile');
            const allNameUserPosts = document.querySelectorAll('.nameuser-profile');
            avatarName.textContent = objectUpdatedUser.nameuser;
            avatarDescription.textContent = objectUpdatedUser.description;
            changePhotoUser = false;
            changePhotoCover = false;
            allImgUserPost.forEach(element => { //renderizamos todas las imagenes del usuario nuevas despues de actualizar
                element.src = objectUpdatedUser.photouser;
            })
            allNameUserPosts.forEach(element => { //renderizamos el nuev nombre del usuario despues de actualizar
                element.textContent = objectUpdatedUser.nameuser;
            })
            await loadViewHeaderUser();
            formEditProfile.reset();
            modal.classList.remove('revelar');
            alerts('success', 'Editado con éxito');
        }).catch((error) => {
            alertProcess(false);
            alerts('error', error);
        })
    })
}

// ----------------------- Evento para Previsualizar Imagen -----------------------------

const previewImageEdit = (filearray, imgElement, infouser) => {
    const reader = new FileReader();
    reader.onloadend = () => imgElement.src = reader.result; //evento se activa cuando la lectura se ha completado
    (filearray) ? reader.readAsDataURL(filearray): imgElement.src = infouser.photoUser;
}

const valueImage = async(filearray, filename, typeImage) => {
    let urlImage, path;
    (typeImage === 'user') ? path = 'users': path = 'covers';
    urlImage = await saveImageFile(filename, filearray, path)
        .then(() => getPhotoURL(filename, path))
        .then((imageURL) => {
            return imageURL;
        });
    return urlImage;
}

// ----------------------- Cargar usuarios para ver otros Perfiles -----------------------------

const showTopTenUsers = async() => {
    const idUserAuth = localStorage.getItem('iduser'); //Esto vien de la linea 58 del archivo eventLogin OBTENER EL ID USER
    const containerTopTenUsers = document.querySelector('#container-friends');
    await getTopTenUsers().then(response => response.forEach(doc => {
        if (doc.id != idUserAuth) {
            const sectionUser = document.createElement('section');
            sectionUser.className = 'info-friends';
            sectionUser.innerHTML = `
                            <img src="${doc.data().photouser}" alt="" class="avatar avatar-sm">
                            <span class="link-user" data-id="${doc.id}"> ${doc.data().nameuser} </span>`
            containerTopTenUsers.appendChild(sectionUser);
        }
    }))
    addEventLinkUser();
}
const loadComponentsProfile = async() => {
    /*Cargamos la Info para el TimeLine-Profile*/
    loadViewModals(); //del crud
    loadTextareaPosts();
    createEmoji();
    await loadViewHeaderUser();
    await loadInfoUser();
    await loadPostUser();
    showButtonsProfile();
    showModalEditProfile();
    showTopTenUsers();
};
export { loadComponentsProfile }