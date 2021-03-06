"use strict";
import _ from "lodash";

interface Option {
  format: string;
  zero_padding_length: number;
  image_dir_path: string;
  image_ext: string;
  normal_messages: Array<NormalMessage>;
  special_messages: Array<SpecialMessage>;
  no_kiriban_message: string;
  no_more_kiriban_message: string;
  next_kiriban_message: string;
}

interface NormalMessage {
  step: number;
  message: string;
}

interface SpecialMessage {
  count: number;
  message: string;
}

class NostalgicCounter {
  constructor() {
    // instance variables
  }

  public static async getCounter(url: string) {
    const res = await fetch(url, {
      mode: "cors",
    }).catch(() => null);

    if (res) {
      const counter = await res.json();
      if (counter && counter.total !== undefined) {
        return counter;
      }
    }

    return null;
  }

  public static showCounter(id: string, count: number, option: Option): void {
    let format = "{count}";
    if (option && option.format !== undefined) {
      format = option.format;
    }

    let zero_padding_length = 0;
    if (option && option.zero_padding_length !== undefined) {
      zero_padding_length = option.zero_padding_length;
    }

    let image_dir_path = "";
    if (option && option.image_dir_path !== undefined) {
      image_dir_path = option.image_dir_path;
    }

    let image_ext = ".gif";
    if (option && option.image_ext !== undefined) {
      image_ext = option.image_ext;
    }

    let html = this.generateCounterHTML(count, format, zero_padding_length, image_dir_path, image_ext);

    const targetElement = document.getElementById(id);
    if (targetElement) {
      targetElement.innerHTML = html;
    }
  }

  public static showKiriban(id: string, count: number, option: Option): void {
    let normal_messages: Array<NormalMessage> = [];
    if (option && option.normal_messages !== undefined) {
      normal_messages = option.normal_messages;
    }

    let special_messages: Array<SpecialMessage> = [];
    if (option && option.special_messages !== undefined) {
      special_messages = option.special_messages;
    }

    let no_kiriban_message = "";
    if (option && option.no_kiriban_message !== undefined) {
      no_kiriban_message = option.no_kiriban_message;
    }

    let no_more_kiriban_message = "";
    if (option && option.no_more_kiriban_message !== undefined) {
      no_more_kiriban_message = option.no_more_kiriban_message;
    }

    let next_kiriban_message = "";
    if (option && option.next_kiriban_message !== undefined) {
      next_kiriban_message = option.next_kiriban_message;
    }

    let html = "";
    if (normal_messages || special_messages) {
      html = this.generateKiribanHTML(
        count,
        normal_messages,
        special_messages,
        no_kiriban_message,
        no_more_kiriban_message,
        next_kiriban_message
      );
    }

    const targetElement = document.getElementById(id);
    if (targetElement) {
      targetElement.innerHTML = html;
    }
  }

  private static zeroPadding(num: number, length: number): string {
    if (String(num).length < length) {
      return ("0000000000" + num).slice(-length);
    }

    return String(num);
  }

  private static convertNumbersToImagePaths(countString: string, dirPath: string, ext: string): Array<string> {
    const splited = String(countString).split("");
    return _.map(splited, (n) => {
      return dirPath + "/" + n + ext;
    });
  }

  private static generateCounterHTML(
    count: number,
    format: string,
    zero_padding_length: number,
    image_dir_path: string,
    image_ext: string
  ): string {
    let html = format;

    let countHTML = this.zeroPadding(count, zero_padding_length);
    if (image_dir_path !== "") {
      const imagePaths = this.convertNumbersToImagePaths(countHTML, image_dir_path, image_ext);

      countHTML = _.map(imagePaths, (p) => {
        return '<img src="' + p + '"></img>';
      }).join("");
    }

    html = html.replace(/{count}/g, '<span class="nc-count">' + countHTML + "</span>");
    html = '<span class="nostalgic-counter">' + html + "</span>";

    return html;
  }

  private static generateKiribanHTML(
    count: number,
    normal_messages: Array<NormalMessage>,
    special_messages: Array<SpecialMessage>,
    no_kiriban_message: string,
    no_more_kiriban_message: string,
    next_kiriban_message: string
  ): string {
    let html = "";

    let normalFound = _.find(normal_messages, (m) => {
      return count % m.step === 0;
    });
    if (normalFound) {
      html += normalFound.message;
      html = html.replace(/{step}/g, '<span class="nc-step">' + normalFound.step + "</span>");
    }

    let specialFound = _.find(special_messages, (m) => {
      return count === m.count;
    });
    if (specialFound) {
      html += specialFound.message;
    }

    if (!normalFound && !specialFound) {
      html += no_kiriban_message;
    }

    let next = Number.MAX_VALUE;
    if (next_kiriban_message !== "") {
      let normalNext = Number.MAX_VALUE;
      normalFound = _.minBy(normal_messages, "step");
      if (normalFound) {
        const minStep = normalFound.step;
        normalNext = count + minStep - (count % minStep);
      }

      let specialNext = Number.MAX_VALUE;
      specialFound = _.find(special_messages, (m) => {
        return count < m.count;
      });
      if (specialFound) {
        specialNext = specialFound.count;
      }

      const found = _.min([normalNext, specialNext]);
      if (found) {
        next = found;
      }
    }

    if (next === Number.MAX_VALUE) {
      html += no_more_kiriban_message;
    } else {
      html += next_kiriban_message;
      html = html.replace(/{next}/g, '<span class="nc-next">' + next + "</span>");
    }

    html = html.replace(/{count}/g, '<span class="nc-count">' + count + "</span>");
    html = html.replace(/{raw_count}/g, String(count));
    html = '<span class="nostalgic-counter">' + html + "</span>";

    return html;
  }
}

export async function getCounter(url: string) {
  return await NostalgicCounter.getCounter(url);
}

export function showCounter(id: string, count: number, option: Option): void {
  NostalgicCounter.showCounter(id, count, option);
}

export function showKiriban(id: string, count: number, option: Option): void {
  NostalgicCounter.showKiriban(id, count, option);
}

export default NostalgicCounter;
