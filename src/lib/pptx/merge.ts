import { promises as fs } from "fs";
import os from "os";
import path from "path";
import Automizer from "pptx-automizer";
import { downloadTopicPptxToBuffer, uploadGeneratedPptx } from "@/lib/pptx/storage";

export interface MergeSource {
  topicId: string;
  fileName: string; // file name to use locally, e.g. "<topicId>.pptx"
}

export interface MergeResult {
  outputFileName: string;
  slideCount: number;
}

/**
 * Concatenates all slides from the given source .pptx files, in order,
 * into a single new .pptx file. No template harmonization — slides are
 * copied as-is from each source.
 *
 * pptx-automizer needs real files on disk, so sources are downloaded from
 * Nextcloud into a temp dir, merged there, and the result is uploaded back
 * to Nextcloud's generated/ folder.
 */
export async function mergePptx(sources: MergeSource[], outputFileName: string): Promise<MergeResult> {
  if (sources.length === 0) throw new Error("Keine Quelldateien zum Zusammenstellen ausgewählt");

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "pptx-"));

  try {
    for (const source of sources) {
      const buffer = await downloadTopicPptxToBuffer(source.topicId);
      await fs.writeFile(path.join(tmpDir, source.fileName), buffer);
    }

    const automizer = new Automizer({
      templateDir: tmpDir,
      outputDir: tmpDir,
      removeExistingSlides: true,
    });

    let pres = automizer.loadRoot(sources[0].fileName);
    sources.forEach((source, i) => {
      pres = pres.load(source.fileName, `src${i}`);
    });

    const info = await automizer.getInfo();

    let slideCount = 0;
    for (let i = 0; i < sources.length; i++) {
      const templateName = `src${i}`;
      const slides = info.slidesByTemplate(templateName);
      for (const slide of slides) {
        pres = pres.addSlide(templateName, slide.number);
        slideCount++;
      }
    }

    await pres.write(outputFileName);

    const resultBuffer = await fs.readFile(path.join(tmpDir, outputFileName));
    await uploadGeneratedPptx(outputFileName, resultBuffer);

    return { outputFileName, slideCount };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}
