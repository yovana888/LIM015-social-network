import { alerts } from "../../lib/alerts.js";
import { getAllUsers, getAllCategories, getAllPosts, getPostByCategory } from "../../db/firestore.js";


// --------------------------------- Obtener todos los Usuarios ---------------------------
const allUsers = () => {
    const objectUsers = [];
    return getAllUsers()
        .then((response) => {
            response.forEach((doc) => {
                objectUsers.push({
                    idUser: doc.id,
                    nameUser: doc.data().nameuser,
                    email: doc.data().email,
                    photoUser: doc.data().photouser,
                    photoCover: doc.data().photocover,
                    description: doc.data().description,
                });
            });
            return objectUsers;
        })
        .catch((error) => alerts("error", "Error en obtener Users: " + error.code));
};

// --------------------------------- Obtener todas la Categorias ---------------------------
const allCategories = () => {
    const objectCategories = [];
    return getAllCategories().then((response) => {
        response.forEach((doc) => {
            objectCategories.push({
                idCategory: doc.id,
                nameCategory: doc.data().category,
                imagen: doc.data().imagen,
                totalPosts: doc.data().totalPosts,
            });
        });
        return objectCategories;
    });
};

// --------------------------------- Obtener todos los Posts ---------------------------
//donde idCategory puede ser todos o uno en particular, lo mismo para iduser
const getObjectPosts = async(idCategory, idUser) => {
    let objectPosts = [];
    const allUsersPosts = await allUsers().then((response) => response);
    const allCategoriesCourses = await allCategories().then((response) => response);
    const queryFirestore = (idCategory != "all") ? getPostByCategory(idCategory) : getAllPosts();
    const idUserAuth = localStorage.getItem('idUserRedirecionar');
    return queryFirestore.then((response) => {
        response.forEach((doc) => {
            const userPost = allUsersPosts.find((element) => element.idUser === doc.data().idUser);
            const categoryprueba = allCategoriesCourses.find((element) => element.idCategory == doc.data().idCategory);

            objectPosts.push({
                idPost: doc.id,
                idUser: doc.data().idUser,
                nameUser: userPost.nameUser,
                photoUser: userPost.photoUser,
                contentPost: doc.data().contentPost,
                datePost: doc.data().datePost.toDate().toDateString(),
                dateprueba: doc.data().datePost.toDate(),
                nameImage: doc.data().nameImage,
                arrLikes: doc.data().arrLikes,
                arrComments: doc.data().arrComments,
                publicPosts: doc.data().publicPosts,
                image: doc.data().image,
                idCategory: doc.data().idCategory,
                nameCategory: categoryprueba.nameCategory,
                urlImage: doc.data().urlImage,
            });
        });
        if (idUser != "all") {
            objectPosts = objectPosts.filter(post => post.idUser == idUserAuth);
        }
        return objectPosts;
    });
};

// --------------------------------- Obtener Los Popular Post---------------------------
const getTopPopularPosts = async() => {
    const objectAllPosts = await getObjectPosts("all", "all").then((response) => response);
    const orderedObject = objectAllPosts.sort((post1, post2) => post2.arrLikes.length - post1.arrLikes.length);
    const topSix = orderedObject.slice(0, 6) // Extraemos los seis post con más likes
    return topSix;
}

export { allUsers, allCategories, getObjectPosts, getTopPopularPosts };