const getAsync = async (url = "") => {
    try {
        const response = await fetch(url);
        const data = await response.json();

        // if(url=="/metals") {
        //     console.log(`${url} returned data \n ${JSON.stringify(data)}`);
        // }

        return data;
    } catch (error) {
        console.log("Error: ", error);
    }
};

const postAsync = async(url = "", data = {}) => {
    try {
        const response = await fetch(url, {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        const json = await response.json();
        // console.log(json);
        return json;
    } catch (error) {
        console.log("Error: ", error);
    }
}

export { getAsync, postAsync };
