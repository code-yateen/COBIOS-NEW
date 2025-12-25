export const createUser = (rounds) => {
    const sets = "123456789qwertyuiopasdfghjklzxcvbnm";
    let user = ""
    for(let i =0;i<rounds;i++){
        user += sets[Math.floor(Math.random() * sets.length)]
    }
    console.log(user)
    return user
}
