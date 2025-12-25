<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'exchange_id' => ['required', 'exists:exchanges,id'],
            'receiver_id' => ['sometimes', 'exists:users,id'],
            'content' => ['required', 'string', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'exchange_id.required' => 'Exchange is required',
            'content.required' => 'Message content is required',
        ];
    }
    protected function prepareForValidation()
    {
        if (!$this->has('receiver_id') && $this->has('exchange_id')) {
            $exchange = \App\Models\Exchange::find($this->exchange_id);
            if ($exchange) {
                $userId = auth()->id();
                $receiverId = $userId === $exchange->learner_id 
                    ? $exchange->teacher_id 
                    : $exchange->learner_id;
                
                $this->merge(['receiver_id' => $receiverId]);
            }
        }
    }
}
