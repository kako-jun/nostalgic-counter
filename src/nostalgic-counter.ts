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
  next_kiriban_message_left: string;
  next_kiriban_message_right: string;
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
      mode: "cors"
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
    if (option && option.format) {
      format = option.format;
    }

    let zero_padding_length = 0;
    if (option && option.zero_padding_length) {
      zero_padding_length = option.zero_padding_length;
    }

    let image_dir_path = "";
    if (option && option.image_dir_path) {
      image_dir_path = option.image_dir_path;
    }

    let image_ext = ".gif";
    if (option && option.image_ext) {
      image_ext = option.image_ext;
    }

    let html = this.generateCounterHTML(count, format, zero_padding_length, image_dir_path, image_ext);

    const counterElement = document.getElementById(id);
    if (counterElement) {
      counterElement.innerHTML = html;
    }
  }

  public static showKiriban(id: string, count: number, option: Option): void {
    let normal_messages: Array<NormalMessage> = [];
    if (option && option.normal_messages) {
      normal_messages = option.normal_messages;
    }

    let special_messages: Array<SpecialMessage> = [];
    if (option && option.special_messages) {
      special_messages = option.special_messages;
    }

    let no_kiriban_message = "";
    if (option && option.no_kiriban_message) {
      no_kiriban_message = option.no_kiriban_message;
    }

    let no_more_kiriban_message = "";
    if (option && option.no_more_kiriban_message) {
      no_more_kiriban_message = option.no_more_kiriban_message;
    }

    let next_kiriban_message_left = "";
    if (option && option.next_kiriban_message_left) {
      next_kiriban_message_left = option.next_kiriban_message_left;
    }

    let next_kiriban_message_right = "";
    if (option && option.next_kiriban_message_right) {
      next_kiriban_message_right = option.next_kiriban_message_right;
    }

    let html = "";
    if (normal_messages || special_messages) {
      html = this.generateKiribanHTML(
        count,
        normal_messages,
        special_messages,
        no_kiriban_message,
        no_more_kiriban_message,
        next_kiriban_message_left,
        next_kiriban_message_right
      );
    }

    const counterElement = document.getElementById(id);
    if (counterElement) {
      counterElement.innerHTML = html;
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
    return _.map(splited, n => {
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

      countHTML = _.map(imagePaths, p => {
        return '<img src="' + p + '"></img>';
      }).join("");
    }

    html = html.replace(/{count}/g, '<span class="nostalgic-counter-count">' + countHTML + "</span>");
    html = '<span class="nostalgic-counter">' + html + "</span>";

    return html;
  }

  private static generateKiribanHTML(
    count: number,
    normal_messages: Array<NormalMessage>,
    special_messages: Array<SpecialMessage>,
    no_kiriban_message: string,
    no_more_kiriban_message: string,
    next_kiriban_message_left: string,
    next_kiriban_message_right: string
  ): string {
    let html = "";

    let normalFound = _.find(normal_messages, m => {
      return count % m.step === 0;
    });
    if (normalFound) {
      html += normalFound.message;
    }

    let specialFound = _.find(special_messages, m => {
      return count === m.count;
    });
    if (specialFound) {
      html += specialFound.message;
    }

    if (!normalFound && !specialFound) {
      html += no_kiriban_message;
    }

    let next = Number.MAX_VALUE;
    if (next_kiriban_message_left !== "" || next_kiriban_message_right !== "") {
      let normalNext = Number.MAX_VALUE;
      normalFound = _.minBy(normal_messages, "step");
      if (normalFound) {
        const minStep = normalFound.step;
        normalNext = count + minStep - (count % minStep);
      }

      let specialNext = Number.MAX_VALUE;
      specialFound = _.find(special_messages, m => {
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
      html += next_kiriban_message_left;
      html += next;
      html += next_kiriban_message_right;
    }

    html = html.replace(/{count}/g, '<span class="nostalgic-counter-count">' + count + "</span>");
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
