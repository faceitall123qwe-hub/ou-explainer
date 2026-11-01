import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { mkdirSync, renameSync, rmSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const VOICE = "pl-PL-MarekNeural";
const RATE = "+10%";

// Spoken text; tech terms spelled phonetically so the voice reads them naturally.
const lines = [
  "Oprogramowanie użytkowe w dwie minuty: Word, Excel, wu be a i projekt na zaliczenie. Oto wszystko, co naprawdę musisz wiedzieć.",
  "Przedmiot ma siedem zjazdów. Zaliczasz go dwoma projektami: aplikacją w Excelu z wu be a i bazą danych w Accessie. Ocena to średnia z projektów plus pięć pytań do każdego z nich.",
  "Wszystko zaczyna się od algorytmu. To przepis: dane wejściowe, przetwarzanie i dane wyjściowe. W schemacie blokowym owal to start i stop, prostokąt to operacja, romb to warunek, a równoległobok to wejście i wyjście.",
  "W Wordzie tabela też liczy. Formuła zawsze zaczyna się od znaku równości: suma powyżej, suma z lewej, średnia, minimum i maksimum. Format zero przecinek zero zero daje dwa miejsca po przecinku.",
  "Makro to mały program w języku wu be a. Rejestrator zapamiętuje twoje kroki, ale nie ruchy myszy. Gotowe makro przypisujesz do skrótu klawiszy albo do przycisku.",
  "Excel. Skoroszyt to plik, arkusz to karta, a komórka ma adres, na przykład A1. Przy kopiowaniu adres A1 się przesuwa, a dolar A dolar 1 zostaje w miejscu.",
  "Edytor wu be a otwierasz skrótem Alt F11. Plik zapisujesz jako iks el es em, czyli z obsługą makr. Kod piszesz w module, między słowami Sub i End Sub.",
  "Dim deklaruje zmienną. InputBox pyta użytkownika, a MsgBox pokazuje komunikat. If wybiera drogę, a pętle For i Do powtarzają kroki.",
  "UserForm to okno twojej aplikacji. Z przybornika wstawiasz etykiety, pola tekstowe, listy i przyciski. Dwuklik na przycisku otwiera kod zdarzenia Click. UserForm1 kropka Show otwiera formularz, a Unload Me go zamyka.",
  "Projekt na zaliczenie: tabela z danymi, przycisk w obszarze nieroboczym i formularz. Przyciski nazywasz czasownikami: dodaj, edytuj, sortuj, utwórz tabelę przestawną. Kolumny nazywasz rzeczownikami.",
  "Algorytm, formuły, makra, adresowanie, wu be a i UserForm. Na obronie znaj swój kod i umiej powiedzieć, co robi każdy przycisk. Powodzenia!",
];

const only = process.argv[2] ? Number(process.argv[2]) : null;
const outRoot = "assets/audio";
mkdirSync(outRoot, { recursive: true });

for (let i = 0; i < lines.length; i++) {
  const n = String(i + 1).padStart(2, "0");
  if (only && only !== i + 1) continue;
  const tmp = join(outRoot, `tmp-${n}`);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  const tts = new MsEdgeTTS();
  await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, {
    wordBoundaryEnabled: true,
  });
  await tts.toFile(tmp, lines[i], { rate: RATE });
  tts.close();
  for (const f of readdirSync(tmp)) {
    const ext = f.endsWith(".mp3") ? "mp3" : "json";
    renameSync(join(tmp, f), join(outRoot, `vo-${n}.${ext}`));
  }
  rmSync(tmp, { recursive: true, force: true });
  console.log(`vo-${n} ok`, existsSync(join(outRoot, `vo-${n}.mp3`)));
}
