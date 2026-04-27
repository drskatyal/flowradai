// Type definitions
export type CategoryType =
    | "normal"
    | "abnormal"

export interface CategoryBadgeConfig {
    label: string;
    badgeColor: string;
}

export interface CategoryBadgeProps {
    category: CategoryType | string;
}

// Helper function to get category badge properties
export const getCategoryBadge = (category: CategoryType | string): CategoryBadgeConfig => {
    const categoryMap: Record<CategoryType, CategoryBadgeConfig> = {
        normal: {
            label: "Normal",
            badgeColor: "bg-green-100 text-green-800"
        },
        abnormal: {
            label: "Abnormal",
            badgeColor: "bg-yellow-100 text-yellow-800"
        },
    };

    return categoryMap[category as CategoryType] || {
        label: "N/A",
        badgeColor: "bg-gray-100 text-gray-800"
    };
};