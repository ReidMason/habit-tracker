package controllers

import (
	"encoding/json"
	"net/http"
)

func success(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}

func successWithBody(w http.ResponseWriter, data interface{}) {
	success(w)
	json.NewEncoder(w).Encode(data)
}
