import { usePage, router } from '@inertiajs/react';
import Dropdown from '@/Components/Legacy/Dropdown';

export function TeamSelector() {
    const user = usePage().props.auth.user;
    const jetstream = usePage().props.jetstream;

    const switchToTeam = (e, team) => {

        e.preventDefault();

        router.put(route('current-team.update'), {
            team_id: team.id
        }, {
            preserveState: false
        });
    };
    return (
        <div className="relative ms-3">
            {/* Teams Dropdown */}
            {jetstream.hasTeamFeatures && (
                <Dropdown
                    align="right"
                    width="60"
                >
                    <Dropdown.Trigger>
                        <span className="inline-flex rounded-md">
                            <button type="button" className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 active:bg-gray-50 dark:active:bg-gray-700 transition ease-in-out duration-150">
                                {user.current_team.name}

                                <svg className="ms-2 -me-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                                </svg>
                            </button>
                        </span>
                    </Dropdown.Trigger>

                    <Dropdown.Content>
                        <div className="w-full">
                            {/* Team Management */}
                            <div className="block px-4 py-2 text-xs text-gray-400">
                                Manage Team
                            </div>
                            {/* Team Settings */}
                            <Dropdown.Link
                                href={route('teams.show', user.current_team)}
                            >
                                Team Settings
                            </Dropdown.Link>
                            {jetstream.canCreateTeams && (
                                <Dropdown.Link
                                    href={route('teams.create')}
                                >
                                    Create New Team
                                </Dropdown.Link>
                            )}
                            {/* Team Switcher */}
                            {(user.all_teams.length > 1) && (
                                <>
                                    <div className="border-t border-gray-200 dark:border-gray-600" />

                                    <div className="block px-4 py-2 text-xs text-gray-400">
                                        Switch Teams
                                    </div>

                                    {user.all_teams.map((team) => (
                                        <Dropdown.Link
                                            as="button"
                                            onClick={(e) => switchToTeam(e, team)}
                                            key={team.id}
                                        >
                                            <div className="flex items-center">
                                                {user.current_team_id == team.id && (
                                                    <svg className="me-2 h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                )}

                                                <div>{team.name}</div>
                                            </div>
                                        </Dropdown.Link>
                                    ))}
                                </>
                            )}
                        </div>
                    </Dropdown.Content>
                </Dropdown>
            )}
        </div>
    )
}