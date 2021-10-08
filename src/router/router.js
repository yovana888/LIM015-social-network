/* eslint-disable no-undef */
import { components } from '../views/components.js';
import { addEventsLogin } from '../views/login/eventsLogin.js';
import { addEventResetPassword } from '../views/password/eventsResetPassword.js';
import { addEventsRegister } from '../views/register/eventsSignUp.js';
import { loadComponetsTimeLine } from '../views/timeline/addInfoTimeLine.js';
import { loadEventsDomTimeLine } from '../views/timeline/eventsTimeline.js';
import { loadComponentsProfile } from '../views/profile/eventsProfile.js'
import { alerts } from '../lib/alerts.js';

const changeView = async(route) => {
    const containerMain = document.querySelector('#container-main');
    containerMain.innerHTML = '';
    let idUser = localStorage.getItem('idUserRedirecionar');
    switch (route) {
        case '/':
        case '':
        case '#/login':
            {
                containerMain.appendChild(components.login());
                window.localStorage.removeItem('iduser'); //Elimina el iduser almacenado en LocalStorage para Asegurarnos que no pueda ingresar al timeline sin loguearse
                window.localStorage.removeItem('idUserRedirecionar');
                addEventsLogin();
                break;
            }
        case '#/signup':
            {
                containerMain.appendChild(components.signUp());
                addEventsRegister();
                break;
            }

        case '#/forgetPassword':
            {
                viewForgetPassword = containerMain.appendChild(components.forgetPassword());
                addEventResetPassword();
                break;
            }
        case '#/timeline':
            {
                const verificar = localStorage.getItem('iduser'); //Aseguramos que no pueda ingresar al timeline sin loguearse
                if (verificar != null || verificar != undefined) {
                    const viewTimeLine = containerMain.appendChild(components.timeLine());
                    const firstChild = viewTimeLine.firstChild; //Buscamos el primer hijo del viewTimeline
                    viewTimeLine.insertBefore(await components.header(), firstChild); //Agrega al header antes del primer hijo de viewTimelime
                    await loadComponetsTimeLine(); /*Agrega toda la info de fb al Timeline*/
                    loadEventsDomTimeLine(); /*Agrega todos los eventos al Timeline*/
                } else {
                    window.location.hash = '#/login';
                    alerts('info', 'Por favor inicie sesion');
                }
                break;
            }
        case `#/profile/${idUser}`:
        case '#/profile':
            {
                const viewProfile = containerMain.appendChild(components.profile());
                const firstChild = viewProfile.firstChild;
                viewProfile.insertBefore(await components.header(), firstChild);
                await loadComponentsProfile(); /*Agrega toda la info de fb al Timeline-profile*/
                loadEventsDomTimeLine(); /*Agrega todos los eventos del Timeline*/
                break;
            }

        default:
            { return containerMain.appendChild(components.error()); }
    }
};

export { changeView };