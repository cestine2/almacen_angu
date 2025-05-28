import { inject } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { MessageService } from "primeng/api";


export type HelperState = {


}

const initialState : HelperState = {


}

type ToastParams = {
  severity: string,
  summary: string,
  detail: string
}

export const HelperStore = signalStore(
  { providedIn: 'root' },

  withState<HelperState>(initialState),
  withMethods(
    (
      state,
      messageService = inject(MessageService)
    ) => ({
      showToast(params:ToastParams){
        messageService.add(params)
      },
    })
  )
)
