import { addEventLinkUser } from "../timeline/eventsTimeline.js";
import { signOut } from '../../db/firebase-auth.js';

export const header = () => {
    const header = document.createElement('header');
    header.className = 'header';
    header.innerHTML = `        

    <a href="#/timeline"> <img class="logo" src="../../assets/images/svg/logo.svg" alt="logo"/> </a>
    <a href="#/timeline"> <img class="icon-logo" src="../../assets/images/svg/favicon.svg" alt="logo"> </a>
    
    <section class="input-search">
        <input type="search" name="" id="search" autocomplete="off">
        <div class="container-result-search"> 
            <ul class="result-search" id="result-search"> </ul>
        </div>
        <div class="container-icon-search"> <i class="fas fa-search"></i> </div>
    </section>
   
    <div class="side-navigation">
        <section class="title-posts">
            <a href="#/timeline" class="title-posts"> <i class="fas fa-house-user"></i> <span>Posts</span> </a>
        </section>
        <section class="title-turn-off">
            <a href="" id="logout" class="title-turn-off">  <i class="fas fa-sign-out-alt"></i> <span>Salir</span> </a>
        </section>
        <section class="user-information" id="user-info">
           
        </section>
    </div>
    `;
    // ------------------------------ Eventos para Search-----------------------------------------------

    const inputSearch = header.querySelector('#search');
    const ulResulSearch = header.querySelector('#result-search');
    const allUsers = JSON.parse(window.localStorage.getItem('allUsers')); //extraemos de local viewHeaderUser Linea 21    
    inputSearch.addEventListener('keyup', () => {
        const search = inputSearch.value.toLowerCase();
        let resultSearch = searchResult(allUsers, search);
        const htmlResultSearch = resultSearch.map(user => `<li> <span class="link-user" data-id="${user.idUser}"> ${user.nameUser} </span> </li> `)
        search != '' ? displayResults(htmlResultSearch) : ulResulSearch.innerHTML = "";
    });

    const searchResult = (allUsers, search) => allUsers.filter(user => user.nameUser.toLowerCase().includes(search)) //user.nameUser.toLowerCase().indexOf(search.toLowerCase()) > -1

    const displayResults = (resultSearch) => {
        const html = resultSearch.length > 0 ? resultSearch.join('') : "";
        ulResulSearch.innerHTML = html;
        addEventLinkUser();
    }

    // ------------------------------ Evento Cerrar Sesión-----------------------------------------------

    const btnSalir = header.querySelector('#logout');
    btnSalir.addEventListener('click', () => {
        signOut().then(() => {
            document.querySelector('#div-body').classList.remove('bodyBackground');
            window.location.hash = '#/login';
        }).catch((error) => {
            alert(error)
        });
    });

    return header;
}