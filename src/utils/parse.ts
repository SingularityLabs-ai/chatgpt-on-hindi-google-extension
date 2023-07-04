export function extract_followups_section(answer_text: string) {
  const splits = answer_text.split(
    /\**#{3}|#{2}|#{1}|#{0}\**\ *\**[fF]ollow-up [qQ]uestions:*\**/
  );
  let followup_section = "";
  if (splits.length >= 2) {
    followup_section = splits[splits.length - 1];
  }
  return followup_section;
}

export function extract_followups(followup_section: string) {
  let final_followups = [];
  if (followup_section.length > 0) {
    let rawsplits = followup_section.split("\n");
    for (var i = 0; i < rawsplits.length; i++) {
      let regnumexp = /[0-9]..*/gi;
      let regbulletexp = /[*+-] .*/gi;
      if (rawsplits[i].match(regnumexp)) {
        final_followups.push(rawsplits[i].slice(2).trim());
      } else if (rawsplits[i].match(regbulletexp)) {
        let x = rawsplits[i].replace("*","").replace("- "," ").trim(); //.replace(/[^a-zA-Z ,?]/g, ""));
        if (x) {
          final_followups.push(x);
        } else {
          final_followups.push();//
          let finesplits = rawsplits[i].split("* ");
          if (finesplits[finesplits.length-1].length > 4 && finesplits[finesplits.length-1].trim()[finesplits[finesplits.length-1].trim().length-1]=="?")
            final_followups.push(finesplits[finesplits.length-1].trim());
        }
      }
    }
  }
  let final_followups_deduped = [...new Set(final_followups)];
  return final_followups_deduped;
}

export const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
export const changeToast: { type: 'success'; text: string } = {
  text: 'Changes saved',
  type: 'success',
}


export function isDate(dateToTest: string) {
  try {
    if (dateToTest) {
      dateToTest = dateToTest.replace(/\s+$/, '');
    }
    return isNaN(dateToTest) && !isNaN(Date.parse(dateToTest));
  } catch(err) {
    return false;
  }
}
