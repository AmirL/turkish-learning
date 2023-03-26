export class AvatarService {
  static async generateRandomAvatarImage(): Promise<string> {
    const uniqueName = Math.random().toString(36).substring(2, 12);
    const avatarResponse = await fetch(
      `https://api.multiavatar.com/${uniqueName}.svg?apikey=${process.env.AVATAR_API_KEY}`
    );
    return (await avatarResponse.text()) ?? '';
  }
}
