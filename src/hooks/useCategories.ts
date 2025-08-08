import { useMemo } from "react";

export type Category = {
    name: string;
    selected: boolean;
}

export function useCategories(categories: Category[], setCategories: React.Dispatch<React.SetStateAction<Category[]>>) {
    // tracks selected categories
    // compute visibleTodos
    // handles category clicks
    // sync with localStorage

    const selectedCategoryNames = useMemo(() => {
        return categories.filter((cat) => cat.selected).map((cat) => cat.name);
    }, [categories]);

    function changeSelectedCategory(name: string): void {
        setCategories(prev =>
            prev.map(category =>
                category.name === name ? { ...category, selected: !category.selected } : category
            )
        );
    }

    return {
        changeSelectedCategory,
        selectedCategoryNames,
    };
}