
"use client";

import {useEffect, useState} from "react";

export default function Switch(){

    const [dark, setDark] = useState(false);

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add("dark");
        } else{
            document.documentElement.classList.remove("dark");
        }
    },[dark]);

    return(
            <button onClick={() => setDark(!dark)} className="dark:border-white dark:text-white p-2 border rounded-lg">{dark ? "Light Mode" : "Dark Mode"}</button>
    )
}