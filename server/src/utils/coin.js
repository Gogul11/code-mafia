import supabase from "../config/db.js";

/**
 * Fetches the number of coins for a given team_id
 * @param {number} team_id - ID of the team
 * @returns {Promise<number|null>} - Returns number of coins or null if not found
 */
export async function getCoinsByTeamId(team_id) {
    const { data, error } = await supabase
        .from("teams")
        .select("coins")
        .eq("id", team_id)
        .single();

    if (error) {
        console.error(`Error fetching coins for team ${team_id}:`, error);
        return null;
    }

    return data.coins;
}

/**
 * Updates the coin balance of a team to a specific value.
 * @param {number} team_id - ID of the team.
 * @param {number} newCoinValue - New coin balance to set.
 * @returns {Promise<boolean>} - True if update succeeded, false otherwise.
 */
export async function updateCoins(team_id, newCoinValue) {
    const { error } = await supabase
        .from("teams")
        .update({ coins: newCoinValue })
        .eq("id", team_id);

    if (error) {
        console.error("Failed to update coins:", error);
        return false;
    }

    return true;
}