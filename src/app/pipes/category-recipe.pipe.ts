import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'categoryRecipe'
})
export class CategoryRecipePipe implements PipeTransform {

  transform(value: Array<any>, args: string | null): Array<any> {
    let filterArgs = []
    if (!args) return value
    if (args === 'todos') return value
    console.log('###', args)
    value.forEach((el, index) => {
      if (args === el.category) {
        filterArgs.push(el)
      }
    })
    return filterArgs
  }

}
