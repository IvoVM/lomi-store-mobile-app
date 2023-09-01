import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchBox'
})
export class SearchBoxPipe implements PipeTransform {

  transform(value: Array<any>, args: string | null = null): Array<any> {
    let filterArgs = []
    if (!args) return value
    value.forEach((el, index) => {
      if (el.title.toLowerCase().includes(args.toLowerCase())) {return filterArgs.push(el)}
      else {
        el.products.forEach(element => {
          if (element.attributes.name.toLowerCase().includes(args.toLowerCase())) {
            let a = filterArgs.find(f => f.title == el.title)
            if (a) return 
            return filterArgs.push(el)
          }
        });
      }
    })
    return filterArgs;
  }

}
