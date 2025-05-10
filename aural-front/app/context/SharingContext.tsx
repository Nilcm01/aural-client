import React, { createContext, useContext, ReactNode } from 'react';
import { useToken } from './TokenContext'
import { router, useNavigation } from 'expo-router';
import { usePlayContent } from '../components/WebPlayback';

const API_AURAL = 'https://aural-454910.ew.r.appspot.com/api/items/';
const API_SPOTIFY = `https://api.spotify.com/v1/`;

// Define content types for sharing
type ContentType = 'song' | 'album' | 'artist' | 'playlist' | 'user';

// Interface for content data returned when parsing links
interface ContentData {
    id: string;
    type: ContentType;
    name?: string;
    album?: string;
    artist?: string;
    creator?: string;
    imageUrl?: string;
    description?: string;
}

// Context interface definition
interface SharingContextType {
    linkCreate: (contentType: ContentType, contentId: string) => string;
    linkGet: (link: string) => Promise<ContentData | null>;
    linkConsume: (link: string) => void;
}

// linkCreate the context
const SharingContext = createContext<SharingContextType | undefined>(undefined);

// Provider component
export const SharingProvider = ({ children }: { children: ReactNode }) => {
    const { token } = useToken();
    const navigation = useNavigation<any>();
    const { playContent } = usePlayContent();

    // Function to linkCreate a sharing link - ok
    const linkCreate = (contentType: ContentType, contentId: string): string => {
        if (contentType === 'user') {
            return `aural:/share/user/${contentId}`;
        } else {
            return `aural:/share/content/${contentType}/${contentId}`;
        }
    };

    // Function to extract and fetch data from a link - ok
    const linkGet = async (link: string): Promise<ContentData | null> => {
        try {
            // Parse the link format
            const regex = /aural:\/share\/(content|user)\/([^\/]+)(?:\/([^\/]+))?/;
            const match = link.match(regex);

            if (!match) return null;

            const [, linkType, param1, param2] = match;

            // Handle user links
            if (linkType === 'user') {
                const userId = param1;
                return await fetchUserData(userId);
            }
            // Handle content links
            else if (linkType === 'content') {
                const contentType = param1 as ContentType;
                const contentId = param2;
                if (!contentId) return null;

                return await fetchContentData(contentId, contentType);
            }

            return null;
        } catch (error) {
            console.error('Error parsing link:', error);
            return null;
        }
    };

    // Function to navigate based on link
    const linkConsume = async (link: string): Promise<void> => {
        try {
            const regex = /aural:\/share\/(content|user)\/([^\/]+)(?:\/([^\/]+))?/;
            const match = link.match(regex);

            if (!match) {
                console.error('Invalid link format');
                return;
            }

            const [, linkType, param1, param2] = match;

            if (linkType === 'user') {
                const userId = param1;
                // Navigate to user profile
                //TODO: router.push(`/profileScreen?userId=${userId}`);
            } else if (linkType === 'content') {
                const contentType = param1 as ContentType;
                const contentId = param2;
                if (!contentId) {
                    console.error('Content ID is missing');
                    return;
                }

                const contentData = await linkGet(link);

                // Navigate based on content type
                switch (contentType) {
                    case 'song':
                        playContent(token?.access_token, 'track', contentId, 0);
                        break;
                    case 'album':
                        navigation.navigate("checkAlbumInfo/[id]", {
                            id: contentId,
                            name: contentData?.name,
                        });
                        break;
                    case 'artist':
                        navigation.navigate("checkArtistInfo/[id]", {
                            id: contentId,
                            name: contentData?.name,
                        });
                        break;
                    case 'playlist':
                        navigation.navigate("checkPlaylistInfo/[id]", {
                            id: contentId
                        });
                        break;
                    default:
                        console.error('Unknown content type:', contentType);
                }
            }
        } catch (error) {
            console.error('Error consuming link:', error);
        }
    };

    // Helper function to fetch user data
    const fetchUserData = async (userId: string): Promise<ContentData | null> => {
        try {
            const response = await fetch(
                `${API_AURAL}profile-info?userId=${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error('Failed to fetch user data');

            const userData = await response.json();
            return {
                id: userId,
                type: 'user',
                name: userData.name,
                imageUrl: userData.imageURL,
                description: userData.description,
            };
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    };

    // Helper function to fetch content data based on type
    const fetchContentData = async (contentId: string, contentType: ContentType): Promise<ContentData | null> => {
        try {
            var type = contentType.toString();
            if (contentType === 'song') type = 'tracks';
            else if (contentType === 'playlist') type = 'playlists';
            else if (contentType === 'artist') type = 'artists';
            else if (contentType === 'album') type = 'albums';
            const response = await fetch(`${API_SPOTIFY}${type}/${contentId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token?.access_token}`
                }
            });

            if (!response.ok) throw new Error(`Failed to fetch ${contentType} data`);

            const data = await response.json();

            // Return different fields based on content type
            switch (contentType) {
                case 'song':
                    return {
                        id: contentId,
                        type: contentType,
                        name: data.name || data.title,
                        album: data.album.name,
                        artist: data.artists[0].name,
                        imageUrl: data.album.images[0]?.url
                    };
                case 'album':
                    return {
                        id: contentId,
                        type: contentType,
                        name: data.name || data.title,
                        artist: data.artists[0].name,
                        imageUrl: data.images[0]?.url
                    };
                case 'artist':
                    return {
                        id: contentId,
                        type: contentType,
                        name: data.name,
                        imageUrl: data.images[0]?.url
                    };
                case 'playlist':
                    return {
                        id: contentId,
                        type: contentType,
                        name: data.name || data.title,
                        creator: data.creator || data.owner,
                        imageUrl: data.imageUrl
                    };
                default:
                    return null;
            }
        } catch (error) {
            console.error(`Error fetching ${contentType} data:`, error);
            return null;
        }
    };

    return (
        <SharingContext.Provider value={{ linkCreate, linkGet, linkConsume }}>
            {children}
        </SharingContext.Provider>
    );
};

// Custom hook for using the sharing context
export const useSharing = (): SharingContextType => {
    const context = useContext(SharingContext);
    if (context === undefined) {
        throw new Error('useSharing must be used within a SharingProvider');
    }
    return context;
};