import { updatePost, getPost, getUser } from "../../db/firestore.js";
import { alerts } from "../../lib/alerts.js";
const reactionLike = () => {
    const allLikes = document.querySelectorAll(".likes");

    allLikes.forEach((btn) => {
        btn.addEventListener("click", async(e) => {
            const idPost = e.target.dataset.id;
            const dataPost = await getPost(idPost).then((response) =>
                response.data()
            );
            const idUserAuth = localStorage.getItem("iduser");
            const imgLike = document.querySelector("#like-" + idPost);
            const countLike = document.querySelector("#count-like-" + idPost);
            let newArrayLike;
            if (dataPost.arrLikes.includes(idUserAuth)) {
                newArrayLike = dataPost.arrLikes.filter((item) => item !== idUserAuth);
                imgLike.src = "../images/svg/notlike.png";
            } else {
                newArrayLike = [...dataPost.arrLikes, idUserAuth];
                imgLike.src = "../images/svg/like.png";
            }
            updatePost(idPost, { arrLikes: newArrayLike });
            countLike.innerText = newArrayLike.length;
        });
    });
};

const addEventComments = () => {
    const allBtnComments = document.querySelectorAll(".btn-comments");
    allBtnComments.forEach((btn) => {
        let flag = false;
        btn.addEventListener("click", async(e) => {
            const idPost = e.target.dataset.id;
            const idUserAuth = localStorage.getItem("iduser");
            const infoUserAuth = await getUser(idUserAuth).then((response) =>
                response.data()
            );
            const footerComments = document.querySelector(
                "#footer-comments-" + idPost
            ); //elemento padre comentarios
            if (flag == false) {
                const boxComment = document.createElement("div");
                boxComment.className = "comments-box box";
                boxComment.innerHTML = ` <div class="box-profile profile">
                                            <img src="${infoUserAuth.photouser}" class="profile-pic">
                                         </div>
                                         <div class="box-bar bar">
                                            <input type="text" id="input-comment-${idPost}" placeholder="Escribe un comentario..." class="bar-input">
                                         </div>
                                         <button class="public-comment" id="btn-comment-${idPost}" type="button">Publicar</button>`;
                footerComments.appendChild(boxComment);

                const dataPost = await getPost(idPost).then((response) =>
                    response.data()
                );
                const arrayComments = dataPost.arrComments;

                if (arrayComments.length > 0) {
                    const allUsers = JSON.parse(window.localStorage.getItem("allUsers")); //extraemos de local viewHeaderUser Linea 21
                    arrayComments.forEach((element) => {
                        let arrayCommentsUser = element.split("--");
                        const userFriend = allUsers.find(
                            (element) => element.idUser == arrayCommentsUser[0]
                        );
                        const boxCommentFriends = showComments([
                            userFriend.photoUser,
                            userFriend.nameUser,
                            arrayCommentsUser[1],
                        ]);
                        footerComments.appendChild(boxCommentFriends);
                    });
                } else {
                    alerts("info", "Sé el primero en comentar...");
                }
                postComment(idPost, arrayComments, idUserAuth, infoUserAuth);
                flag = true;
            } else {
                footerComments.innerHTML = "";
                flag = false;
            }
        });
    });
};

function postComment(idPost, arrayComments, idUserAuth, infoUserAuth) {
    const btnComment = document.querySelector("#btn-comment-" + idPost);
    const inputComment = document.querySelector("#input-comment-" + idPost);
    const spanTotalComments = document.querySelector('#count-comment-' + idPost);
    btnComment.addEventListener("click", () => {
        if (inputComment.value != "") {
            const newCommentUser = idUserAuth + "--" + inputComment.value;
            arrayComments.push(newCommentUser);
            updatePost(idPost, { arrComments: arrayComments })
                .then(() => {
                    const footerComments = document.querySelector(
                        "#footer-comments-" + idPost
                    );
                    const boxCommentFriends = showComments([
                        infoUserAuth.photouser,
                        infoUserAuth.nameuser,
                        inputComment.value,
                    ]);
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

function showComments(arrayInfo) {
    const boxCommentFriends = document.createElement("div");
    boxCommentFriends.classList.add("comments-friend-comment", "friend-comment");
    boxCommentFriends.innerHTML = `
                        <img src="${arrayInfo[0]}" class="friend-comment-pic">
                        <div class="friend-comment-comment comment">
                            <p class="comment-author"> ${arrayInfo[1]} </p>
                            <span class="comment-content"> ${arrayInfo[2]} </span>
                        </div>
                        `;
    return boxCommentFriends;
}
export { reactionLike, addEventComments };