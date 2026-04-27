import { useState } from "react";

export const useSidebar = () => {
    const [isSidebar, setIsSidebar] = useState(true);

    return {
        isSidebar,
        setIsSidebar
    }
}