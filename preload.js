const path = require('path')
const { shell } = require('electron')
const numeral = require(path.join(__dirname, 'lib', 'numeral.min.js'))
const math = require(path.join(__dirname, 'lib', 'math.min.js'))

// load a format
numeral.register('format', 'little_number', {
    regexps: {
        format: /(A)/,
        unformat: /(A)/
    },
    format: function(value, format, roundingFunction) {
        var space = numeral._.includes(format, ' A') ? ' ' : '',
            output;
        if (value >= 1) return numeral._.numberToFormat(value, format.replace("A", "a"), roundingFunction)
        var si_list = ["m", "µ", "n", "p", "f", "a"]
        var the_si = ""
        for (const si of si_list) {
            value = value * 1000
            if (value >= 1) {
                the_si = si
                break
            }
        }

        // check for space before %
        format = format.replace(/\s?A/, '');

        output = numeral._.numberToFormat(value, format, roundingFunction);

        if (numeral._.includes(output, ')')) {
            output = output.split('');

            output.splice(-1, 0, space + the_si);

            output = output.join('');
        } else {
            output = output + space + the_si;
        }

        return output;
    },
    unformat: function(string) {
        return NaN;
    }
});

// use your custom format
numeral().format('0%');

window.exports = {
  'calc': {
    mode: 'list',
    args: {
      enter: (action, callbackSetList) => {
      },
      search: (action, searchWord, callbackSetList) => {
        if (!searchWord) return callbackSetList()
        var res_num = math.evaluate(searchWord)
        var res = numeral(res_num)
        var format_list = []
        format_list.push({description: "sci", format: "0.000000e+0", check: (num)=>num<1e-18&&num!=0})
        format_list.push({description: "base1000", format: "0.[000000] A", check: (num)=>num!=0&&num<=1})
        format_list.push({description: "base1000", format: "0.[000000] b", check: (num)=>num>1})
        format_list.push({description: "base1000", format: "0", check: (num)=>num==0})
        format_list.push({description: "base1024", format: "0.[000000] ib", check: (num)=>num>1})
        format_list.push({description: "percentage", format: "0.00%", check: (num)=>num<=10&&num>=0.0001})
        var formated = []
        format_list.forEach((ele) => ele.check(math.abs(res_num))&&formated.push({title: res.format(ele.format), description: ele.description}))
        return callbackSetList(formated)
      },
      select: (action, itemData) => {
        window.utools.hideMainWindow()
      }
    }
  },
}