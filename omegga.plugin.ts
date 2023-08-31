import OmeggaPlugin, { OL, PS, PC } from 'omegga';

type Config = { foo: string };
type Storage = { bar: string };

export default class Plugin implements OmeggaPlugin<Config, Storage> {
  omegga: OL;
  config: PC<Config>;
  store: PS<Storage>;

  constructor(omegga: OL, config: PC<Config>, store: PS<Storage>) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;
  }

  public limitedUsers: { [playerName: string]: number } = {};

  public isAuthorized(playerName: string): boolean {
    const player = this.omegga.getPlayer(playerName);
    if (player.isHost()) return true;
    if (this.config["Limited Mode"] && !player.getRoles().includes(this.config["Cooldown Bypass Role"])) {
        this.omegga.whisper(playerName, `You are not allowed to use this command.`);
        return false;
    }
    if (player.getRoles().includes(this.config["Blacklist Role"])) {
        this.omegga.whisper(playerName, `You are not allowed to use this command.`);
        return false
    }
    if (player.getRoles().includes(this.config["Cooldown Bypass Role"])) return true;

    for (let user in this.limitedUsers) {
        if (user !== playerName) continue;
        if (this.limitedUsers[user] < Date.now()) {
            delete this.limitedUsers[user];
            continue;
        }
        this.omegga.whisper(
            playerName,
            `You're on cooldown, please try again in ${Math.trunc((this.limitedUsers[user] - Date.now()) / 1000)} seconds.`
        );
        return false;
    }
    return true;
} 

  public setAuthorizedTimeout(playerName: string): void {
      this.limitedUsers[playerName] = Date.now() + this.config["Command Cooldown"] * 1000;
  }


  async init() {
             //8ball
             this.omegga.on("cmd:8ball", (speaker: string) => {
              if (!this.isAuthorized(speaker)) return;
              this.setAuthorizedTimeout(speaker)
              const player = this.omegga.getPlayer(speaker);
      
              const positiveNames: string[] = [
                  "Yes,",
                  "Signs point to yes,",
                  "It is certain,",
                  "Most likely,",
                  "Without a doubt,",
                  "As I see it, yes,",
                  "You may rely on it,",
                  "Very likely,",
                  "It is decidedly so,",
                  "Yes definitely,",
                  "Outlook good,",
  
              ];
  
              const negativeNames: string[] = [
                  "No,",
                  "My sources say no,",
                  "Outlook not so good,",
                  "Very doubtful,",
                  "Don't count on it,",
                  "My reply is no,",
                  
  
              ];
  
              const neutralNames: string[] = [
                  "Maybe,",
                  "Cannot predict now,",
                  "Ask again later,",
                  "Concentrate and ask again,",
                  "Reply hazy, try again,",
                  "Better not tell you now,",
                  
  
              ];
  
              const eightballNames: string[][] = [positiveNames, negativeNames, neutralNames]
              const index = Math.trunc(Math.random() * eightballNames.length)
              const pick = eightballNames[index];
              const chosenEightball = pick[Math.trunc(Math.random() * pick.length)];
              let message = `${chosenEightball}`;
  
              console.log(chosenEightball)
              let formatted_message = `<b><color="444444">(</>8<color="444444">)</></>: ${message} ${player.name}</>`
              if (Math.random()*100<1)
              {
                   formatted_message = `<b><color="444444">(</>6<color="444444">)</></>: ${message} ${player.name}</>`
              }
              this.omegga.broadcast(formatted_message);
          });

    return { registeredCommands: ['8ball'] };
  }

  async stop() {
    // Anything that needs to be cleaned up...
  }
}
