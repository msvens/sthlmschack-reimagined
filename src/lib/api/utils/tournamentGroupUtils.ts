/**
 * Utility functions for working with tournament groups
 */

import { TournamentDto, TournamentClassDto, TournamentClassGroupDto } from '../types';

/**
 * Recursively searches through tournament classes to find a group by ID
 * @param classes Array of tournament classes to search
 * @param groupId Group ID to find
 * @returns Group object if found, null otherwise
 */
function findGroupInClasses(classes: TournamentClassDto[], groupId: number): TournamentClassGroupDto | null {
  for (const tournamentClass of classes) {
    // Search groups in this class
    const group = tournamentClass.groups?.find(g => g.id === groupId);
    if (group) {
      return group;
    }

    // Recursively search subclasses
    if (tournamentClass.subClasses && tournamentClass.subClasses.length > 0) {
      const foundInSubclass = findGroupInClasses(tournamentClass.subClasses, groupId);
      if (foundInSubclass) {
        return foundInSubclass;
      }
    }
  }

  return null;
}

/**
 * Get tournament group metadata by its ID
 * @param tournament Tournament data containing class hierarchy
 * @param groupId Group ID to find
 * @returns Group object if found, null otherwise
 */
export function findTournamentGroup(tournament: TournamentDto, groupId: number): TournamentClassGroupDto | null {
  if (!tournament.rootClasses || tournament.rootClasses.length === 0) {
    return null;
  }

  return findGroupInClasses(tournament.rootClasses, groupId);
}

/**
 * Get the name of a tournament group by its ID
 * @param tournament Tournament data containing class hierarchy
 * @param groupId Group ID to find
 * @returns Group name if found, empty string otherwise
 */
export function getGroupName(tournament: TournamentDto, groupId: number): string {
  const group = findTournamentGroup(tournament, groupId);
  return group?.name || '';
}