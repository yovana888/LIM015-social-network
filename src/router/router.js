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
                const viewLogin = containerMain.appendChild(components.login());
                window.localStorage.removeItem('iduser');
                window.localStorage.removeItem('idUserRedirecionar');
                addEventsLogin();
                return viewLogin;
            }
        case '#/signup':
            {
                const viewRegistro = containerMain.appendChild(components.signUp());
                addEventsRegister();
                return viewRegistro;
            }

        case '#/forgetPassword':
            {
                const viewForgetPassword = containerMain.appendChild(components.forgetPassword());
                addEventResetPassword();
                return viewForgetPassword;
            }
        case '#/timeline':
            {
                window.localStorage.removeItem('idUserRedirecionar');
                const verificar = localStorage.getItem('iduser');
                if (verificar != null || verificar != undefined) {
                    const viewTimeLine = containerMain.appendChild(components.timeLine());
                    const firstChild = viewTimeLine.firstChild;
                    viewTimeLine.insertBefore(components.header(), firstChild);
                    await loadComponetsTimeLine(); /*Agrega toda la info de fb al Timeline*/
                    loadEventsDomTimeLine(); /*Agrega todos los eventos al Timeline*/
                    return viewTimeLine;
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
                viewProfile.insertBefore(components.header(), firstChild);
                await loadComponentsProfile(); /*Agrega toda la info de fb al Timeline-profile*/
                loadEventsDomTimeLine(); /*Agrega todos los eventos del Timeline*/
                return viewProfile;
            }

        default:
            { return containerMain.appendChild(components.error()); }
    }
};

export { changeView };